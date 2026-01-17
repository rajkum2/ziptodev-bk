const axios = require('axios');
const logger = require('../../utils/logger');

/**
 * DeepSeek API Provider
 * Calls DeepSeek's hosted API endpoint
 */
class DeepSeekAPIProvider {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.timeout = parseInt(process.env.LLM_TIMEOUT_MS) || 30000;

    if (!this.apiKey) {
      logger.warn('DEEPSEEK_API_KEY not configured');
    }
  }

  /**
   * Send chat completion request to DeepSeek API
   */
  async sendMessage(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const url = `${this.baseURL}/chat/completions`;
    
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: this.timeout
      });

      const latency = Date.now() - startTime;

      logger.info('DeepSeek API call successful', {
        model: this.model,
        latency: `${latency}ms`,
        usage: response.data.usage
      });

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
        latency
      };

    } catch (error) {
      logger.error('DeepSeek API error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error('DeepSeek API request timed out');
      }

      if (error.response?.status === 401) {
        throw new Error('Invalid DeepSeek API key');
      }

      if (error.response?.status === 429) {
        throw new Error('DeepSeek API rate limit exceeded');
      }

      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }

  /**
   * Check if provider is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }
}

module.exports = DeepSeekAPIProvider;

