const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * Local OpenAI-Compatible LLM Provider
 * Supports vLLM, Text Generation Inference, LocalAI, etc.
 */
class LocalOpenAIProvider {
  constructor() {
    this.baseURL = process.env.LOCAL_LLM_BASE_URL || 'http://localhost:8000';
    this.model = process.env.LOCAL_LLM_MODEL || 'deepseek-chat';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 30000;
  }

  /**
   * Send chat completion request to local OpenAI-compatible server
   */
  async sendMessage(messages, options = {}) {
    const url = `${this.baseURL}/v1/chat/completions`;
    
    const requestBody = {
      model: options.model || this.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 500,
      stream: false
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

      logger.info('Local OpenAI-compatible LLM call successful', {
        model: this.model,
        latency: `${latency}ms`,
        usage: response.data.usage
      });

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage || {},
        model: response.data.model || this.model,
        latency
      };

    } catch (error) {
      logger.error('Local OpenAI-compatible LLM error:', {
        message: error.message,
        url: url,
        status: error.response?.status
      });

      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new Error(`Cannot connect to local LLM server at ${this.baseURL}`);
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('Local LLM request timed out');
      }

      throw new Error(`Local LLM error: ${error.message}`);
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
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      logger.warn('Local LLM health check failed:', error.message);
      return false;
    }
  }
}

module.exports = LocalOpenAIProvider;

