const fs = require('fs');
const path = require('path');
const KnowledgeDocument = require('../models/KnowledgeDocument');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const ApiResponse = require('../utils/response');
const AuditLogger = require('../utils/auditLog');
const logger = require('../utils/logger');
const vectorStore = require('../services/vectorstore/vectorstore');
const embeddings = require('../services/embeddings/ollamaEmbeddings');
const { ingestDocument } = require('../services/knowledge/ingest.service');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');

const getFileTypeFromName = (fileName) => {
  const ext = path.extname(fileName || '').toLowerCase();
  switch (ext) {
    case '.txt':
      return 'txt';
    case '.md':
      return 'md';
    case '.pdf':
      return 'pdf';
    case '.docx':
      return 'docx';
    default:
      return null;
  }
};

const parseTags = (tagsInput) => {
  if (!tagsInput) return [];
  if (Array.isArray(tagsInput)) {
    return tagsInput.map(tag => String(tag).trim()).filter(Boolean);
  }
  if (typeof tagsInput === 'string') {
    return tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
  }
  return [];
};

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.error(res, 'No file uploaded', 'NO_FILE', 400);
    }

    const fileType = getFileTypeFromName(req.file.originalname);
    if (!fileType) {
      return ApiResponse.error(res, 'Unsupported file type', 'UNSUPPORTED_FILE', 400);
    }

    const title = req.body.title?.trim() || path.basename(req.file.originalname, path.extname(req.file.originalname));
    const tags = parseTags(req.body.tags);

    const document = await KnowledgeDocument.create({
      title,
      originalFileName: req.file.originalname,
      fileType,
      storage: {
        storageDriver: 'local',
        filePath: req.file.path,
        fileSize: req.file.size
      },
      status: {
        ingestionStatus: 'uploaded',
        enabledForChat: false,
        tags
      },
      createdByAdminId: req.adminId
    });

    AuditLogger.logKnowledgeOperation(req.admin, 'UPLOAD', document._id, document.title);

    // TODO: Move ingestion to a background queue (BullMQ) for large documents
    await ingestDocument(document._id);

    const updated = await KnowledgeDocument.findById(document._id)
      .populate('createdByAdminId', 'username email')
      .lean();

    return ApiResponse.success(res, updated, 'Document uploaded and ingested', 201);
  } catch (error) {
    next(error);
  }
};

exports.getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, enabled, search } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);

    const query = {};

    if (status) {
      query['status.ingestionStatus'] = status;
    }

    if (enabled !== undefined) {
      query['status.enabledForChat'] = enabled === 'true';
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { originalFileName: new RegExp(search, 'i') }
      ];
    }

    const [documents, total] = await Promise.all([
      KnowledgeDocument.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('createdByAdminId', 'username email')
        .lean(),
      KnowledgeDocument.countDocuments(query)
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);
    return ApiResponse.paginated(res, documents, pagination);
  } catch (error) {
    next(error);
  }
};

exports.getDocument = async (req, res, next) => {
  try {
    const document = await KnowledgeDocument.findById(req.params.id)
      .populate('createdByAdminId', 'username email')
      .lean();

    if (!document) {
      return ApiResponse.notFound(res, 'Knowledge document');
    }

    return ApiResponse.success(res, document);
  } catch (error) {
    next(error);
  }
};

exports.updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, tags, enabledForChat } = req.body;

    const document = await KnowledgeDocument.findById(id);
    if (!document) {
      return ApiResponse.notFound(res, 'Knowledge document');
    }

    const changes = {};

    if (title !== undefined && title.trim() && title !== document.title) {
      changes.title = { old: document.title, new: title.trim() };
      document.title = title.trim();
    }

    if (tags !== undefined) {
      const parsedTags = parseTags(tags);
      changes.tags = { old: document.status.tags || [], new: parsedTags };
      document.status.tags = parsedTags;
    }

    if (enabledForChat !== undefined) {
      const enabled = enabledForChat === true || enabledForChat === 'true';
      if (enabled !== document.status.enabledForChat) {
        changes.enabledForChat = { old: document.status.enabledForChat, new: enabled };
        document.status.enabledForChat = enabled;
      }
    }

    await document.save();

    if (changes.enabledForChat) {
      AuditLogger.logKnowledgeOperation(
        req.admin,
        document.status.enabledForChat ? 'ENABLE' : 'DISABLE',
        document._id,
        document.title,
        changes
      );
    } else {
      AuditLogger.logKnowledgeOperation(req.admin, 'UPDATE', document._id, document.title, changes);
    }

    const updated = await KnowledgeDocument.findById(document._id)
      .populate('createdByAdminId', 'username email')
      .lean();

    return ApiResponse.success(res, updated, 'Document updated');
  } catch (error) {
    next(error);
  }
};

exports.reindexDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await KnowledgeDocument.findById(id);
    if (!document) {
      return ApiResponse.notFound(res, 'Knowledge document');
    }

    await KnowledgeChunk.deleteMany({ documentId: id });
    await vectorStore.deleteByDocument(id);

    AuditLogger.logKnowledgeOperation(req.admin, 'REINDEX', document._id, document.title);

    await ingestDocument(id);

    const updated = await KnowledgeDocument.findById(id)
      .populate('createdByAdminId', 'username email')
      .lean();

    return ApiResponse.success(res, updated, 'Document re-indexed');
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await KnowledgeDocument.findById(id);
    if (!document) {
      return ApiResponse.notFound(res, 'Knowledge document');
    }

    await KnowledgeChunk.deleteMany({ documentId: id });
    await vectorStore.deleteByDocument(id);

    if (document.storage?.filePath && fs.existsSync(document.storage.filePath)) {
      try {
        fs.unlinkSync(document.storage.filePath);
      } catch (error) {
        logger.warn('Failed to delete knowledge file', {
          documentId: document._id,
          filePath: document.storage.filePath,
          error: error.message
        });
      }
    }

    await document.deleteOne();

    AuditLogger.logKnowledgeOperation(req.admin, 'DELETE', document._id, document.title);

    return ApiResponse.success(res, null, 'Document deleted');
  } catch (error) {
    next(error);
  }
};

exports.listChunks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);

    const [chunks, total] = await Promise.all([
      KnowledgeChunk.find({ documentId: id })
        .sort({ chunkIndex: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      KnowledgeChunk.countDocuments({ documentId: id })
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);
    return ApiResponse.paginated(res, chunks, pagination);
  } catch (error) {
    next(error);
  }
};

exports.searchKnowledge = async (req, res, next) => {
  try {
    const { query, topK = 6, documentId } = req.body;

    const enabledDocsQuery = {
      'status.ingestionStatus': 'ready',
      'status.enabledForChat': true
    };

    if (documentId) {
      enabledDocsQuery._id = documentId;
    }

    const enabledDocs = await KnowledgeDocument.find(enabledDocsQuery)
      .select('title _id')
      .lean();

    if (!enabledDocs.length) {
      return ApiResponse.success(res, [], 'No enabled documents found');
    }

    const queryEmbedding = await embeddings.embedText(query);
    const matches = await vectorStore.query(queryEmbedding, parseInt(topK), {
      documentIds: enabledDocs.map(doc => doc._id)
    });

    const docMap = enabledDocs.reduce((acc, doc) => {
      acc[doc._id.toString()] = doc.title;
      return acc;
    }, {});

    const results = matches.map(match => ({
      text: match.text,
      score: match.score,
      documentId: match.metadata?.documentId || null,
      title: docMap[match.metadata?.documentId] || 'Unknown',
      chunkIndex: match.metadata?.chunkIndex ?? 0,
      page: match.metadata?.page || null
    }));

    return ApiResponse.success(res, results, 'Search completed');
  } catch (error) {
    logger.error('Knowledge search failed:', error);
    next(error);
  }
};
