const DeepSeekAPIProvider = require('./deepseek.api');
const LocalOpenAIProvider = require('./local.openai');
const LocalOllamaProvider = require('./local.ollama');
const logger = require('../../utils/logger');

/**
 * LLM Router
 * Routes requests to the appropriate LLM provider based on configuration
 */
class LLMRouter {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'local_llm';
    this.compatMode = process.env.LOCAL_LLM_COMPAT_MODE || 'openai';
    this.client = this.initializeProvider();
  }

  /**
   * Initialize the appropriate provider based on configuration
   */
  initializeProvider() {
    logger.info(`Initializing LLM provider: ${this.provider}`);

    switch (this.provider) {
      case 'deepseek_api':
        return new DeepSeekAPIProvider();

      case 'local_llm':
        if (this.compatMode === 'ollama') {
          return new LocalOllamaProvider();
        } else {
          // Default to OpenAI-compatible (vLLM, TGI, LocalAI, etc.)
          return new LocalOpenAIProvider();
        }

      default:
        logger.warn(`Unknown AI provider: ${this.provider}, defaulting to local_llm`);
        return new LocalOpenAIProvider();
    }
  }

  /**
   * Send a chat message through the configured provider
   */
  async sendMessage(messages, options = {}) {
    if (!this.client.isConfigured()) {
      throw new Error(`LLM provider ${this.provider} is not properly configured`);
    }

    try {
      const result = await this.client.sendMessage(messages, options);
      return result;
    } catch (error) {
      logger.error('LLM Router error:', {
        provider: this.provider,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get provider information
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      compatMode: this.provider === 'local_llm' ? this.compatMode : null,
      configured: this.client.isConfigured()
    };
  }

  /**
   * Health check for the current provider
   */
  async healthCheck() {
    if (typeof this.client.healthCheck === 'function') {
      return await this.client.healthCheck();
    }
    return this.client.isConfigured();
  }
}

// Export singleton instance
module.exports = new LLMRouter();

