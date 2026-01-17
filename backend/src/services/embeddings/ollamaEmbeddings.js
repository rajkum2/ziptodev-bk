const axios = require('axios');
const logger = require('../../utils/logger');

class OllamaEmbeddings {
  constructor() {
    this.baseURL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 60000;
  }

  isConfigured() {
    return !!this.baseURL && !!this.model;
  }

  async embedText(text) {
    const url = `${this.baseURL}/api/embeddings`;
    try {
      const response = await axios.post(url, {
        model: this.model,
        prompt: text
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: this.timeout
      });

      return response.data.embedding;
    } catch (error) {
      logger.error('Ollama embeddings error:', {
        message: error.message,
        url,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async embedBatch(texts = []) {
    const embeddings = [];
    for (const text of texts) {
      // Ollama embeddings endpoint does not support batch in all versions
      // Loop safely for POC
      const vector = await this.embedText(text);
      embeddings.push(vector);
    }
    return embeddings;
  }
}

module.exports = new OllamaEmbeddings();
