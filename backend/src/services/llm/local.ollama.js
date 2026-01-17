const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Local Ollama LLM Provider
 * Supports Ollama local inference server
 */
class LocalOllamaProvider {
  constructor() {
    this.baseURL = process.env.LOCAL_LLM_BASE_URL || 'http://localhost:11434';
    this.model = process.env.LOCAL_LLM_MODEL || 'deepseek-r1:latest';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 60000; // Ollama can be slower
  }

  /**
   * Send chat request to Ollama API
   */
  async sendMessage(messages, options = {}) {
    const url = `${this.baseURL}/api/chat`;
    
    const requestBody = {
      model: options.model || this.model,
      messages: messages,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 500
      }
    };

    try {
      const startTime = Date.now();
      
      const response = await axios.post(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      const latency = Date.now() - startTime;

      logger.info('Ollama LLM call successful', {
        model: this.model,
        latency: `${latency}ms`
      });

      // Ollama response format is different
      const content = response.data.message?.content || response.data.response;

      return {
        content: content,
        usage: {
          prompt_tokens: response.data.prompt_eval_count || 0,
          completion_tokens: response.data.eval_count || 0,
          total_tokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
        },
        model: response.data.model || this.model,
        latency
      };

    } catch (error) {
      logger.error('Ollama LLM error:', {
        message: error.message,
        url: url,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error(`Cannot connect to Ollama server at ${this.baseURL}`);
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Ollama request timed out');
      }

      if (error.response?.data?.error) {
        throw new Error(`Ollama error: ${error.response.data.error}`);
      }

      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  /**
   * Check if provider is configured
   */
  isConfigured() {
    return !!this.baseURL;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      logger.warn('Ollama health check failed:', error.message);
      return false;
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      return response.data.models || [];
    } catch (error) {
      logger.error('Failed to list Ollama models:', error.message);
      return [];
    }
  }
}

module.exports = LocalOllamaProvider;

