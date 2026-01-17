const KnowledgeDocument = require('../../models/KnowledgeDocument');
const KnowledgeChunk = require('../../models/KnowledgeChunk');
const embeddings = require('../embeddings/ollamaEmbeddings');
const vectorStore = require('../vectorstore/vectorstore');
const { chunkText } = require('./chunking');
const { extractPlainText } = require('./textExtractors/plain');
const { extractPdfText } = require('./textExtractors/pdf');
const { extractDocxText } = require('./textExtractors/docx');
const logger = require('../../utils/logger');

const normalizeText = (text = '') => {
  return text.replace(/\s+/g, ' ').trim();
};

const extractText = async (document) => {
  const filePath = document.storage.filePath;
  switch (document.fileType) {
    case 'txt':
    case 'md':
      return extractPlainText(filePath);
    case 'pdf':
      return extractPdfText(filePath);
    case 'docx':
      return extractDocxText(filePath);
    default:
      throw new Error(`Unsupported file type: ${document.fileType}`);
  }
};

const ingestDocument = async (documentId) => {
  const document = await KnowledgeDocument.findById(documentId);
  if (!document) {
    throw new Error('Knowledge document not found');
  }

  try {
    document.status.ingestionStatus = 'processing';
    document.status.errorMessage = null;
    await document.save();

    const { text, pageCount } = await extractText(document);
    const normalized = normalizeText(text);

    if (!normalized) {
      throw new Error('No extractable text found in document');
    }

    const chunkSize = parseInt(process.env.KNOWLEDGE_CHUNK_SIZE) || 1000;
    const overlap = parseInt(process.env.KNOWLEDGE_CHUNK_OVERLAP) || 120;
    const chunks = chunkText(normalized, { chunkSize, overlap });

    if (!chunks.length) {
      throw new Error('Failed to generate chunks from document');
    }

    const embeddingsList = await embeddings.embedBatch(chunks.map(chunk => chunk.text));

    const upsertChunks = chunks.map((chunk, idx) => ({
      id: `${document._id}_${idx}`,
      text: chunk.text,
      metadata: {
        ...chunk.metadata,
        chunkIndex: idx
      },
      embedding: embeddingsList[idx]
    }));

    const vectorIds = await vectorStore.upsertChunks(document._id, upsertChunks);

    const chunkDocs = upsertChunks.map((chunk, idx) => ({
      documentId: document._id,
      chunkIndex: idx,
      text: chunk.text,
      metadata: chunk.metadata,
      vectorId: vectorIds[idx]
    }));

    await KnowledgeChunk.insertMany(chunkDocs);

    document.stats.pageCount = pageCount || undefined;
    document.stats.chunkCount = chunkDocs.length;
    document.stats.embeddingModel = embeddings.model;
    document.status.ingestionStatus = 'ready';
    await document.save();

    logger.info('Knowledge ingestion completed', {
      documentId: document._id,
      chunkCount: chunkDocs.length
    });

    return document;
  } catch (error) {
    document.status.ingestionStatus = 'failed';
    document.status.errorMessage = error.message;
    await document.save();

    logger.error('Knowledge ingestion failed', {
      documentId,
      error: error.message
    });

    throw error;
  }
};

module.exports = {
  ingestDocument,
  normalizeText
};
