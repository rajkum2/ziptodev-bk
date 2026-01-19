const { ChromaClient } = require('chromadb');
const logger = require('../../utils/logger');

class ChromaVectorStore {
  constructor() {
    this.baseURL = process.env.CHROMA_BASE_URL || 'http://localhost:8001';
    this.collectionName = process.env.CHROMA_COLLECTION || 'zipto_knowledge_chunks';

    // Parse URL to get host, port, and ssl
    const url = new URL(this.baseURL);
    this.client = new ChromaClient({
      host: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      ssl: url.protocol === 'https:'
    });
    this.collectionPromise = null;
  }

  async getCollection() {
    if (!this.collectionPromise) {
      this.collectionPromise = this.client.getOrCreateCollection({
        name: this.collectionName
      });
    }
    return this.collectionPromise;
  }

  async upsertChunks(documentId, chunks = []) {
    if (!chunks.length) return [];
    const collection = await this.getCollection();

    const ids = chunks.map(chunk => chunk.id);
    const embeddings = chunks.map(chunk => chunk.embedding);
    const documents = chunks.map(chunk => chunk.text);
    const metadatas = chunks.map(chunk => ({
      documentId: documentId.toString(),
      chunkIndex: chunk.metadata?.chunkIndex ?? chunk.chunkIndex ?? 0,
      page: chunk.metadata?.page ?? null,
      heading: chunk.metadata?.heading ?? null,
      startChar: chunk.metadata?.startChar ?? null,
      endChar: chunk.metadata?.endChar ?? null
    }));

    await collection.upsert({
      ids,
      embeddings,
      documents,
      metadatas
    });

    logger.info('Chroma upsert completed', {
      documentId,
      count: ids.length
    });

    return ids;
  }

  async query(queryEmbedding, topK = 6, filter = {}) {
    const collection = await this.getCollection();
    const queryParams = {
      queryEmbeddings: [queryEmbedding],
      nResults: topK
    };

    if (filter.documentId) {
      queryParams.where = { documentId: String(filter.documentId) };
    } else if (filter.documentIds?.length) {
      queryParams.where = { documentId: { '$in': filter.documentIds.map(String) } };
    }

    const results = await collection.query(queryParams);

    const ids = results.ids?.[0] || [];
    const documents = results.documents?.[0] || [];
    const metadatas = results.metadatas?.[0] || [];
    const distances = results.distances?.[0] || [];

    return documents.map((text, idx) => ({
      id: ids[idx],
      text,
      metadata: metadatas[idx] || {},
      score: distances[idx] !== undefined ? 1 - distances[idx] : null
    }));
  }

  async deleteByDocument(documentId) {
    const collection = await this.getCollection();
    await collection.delete({
      where: { documentId: String(documentId) }
    });
  }
}

module.exports = ChromaVectorStore;
