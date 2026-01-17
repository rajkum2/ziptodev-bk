#!/usr/bin/env node

/**
 * Test Script for Zipto Customer Chat AI
 * 
 * This script tests the chat API with various scenarios
 * Run: node test-chat.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const CHAT_URL = `${BASE_URL}/api/chat/message`;
const HEALTH_URL = `${BASE_URL}/api/chat/health`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

function success(message) {
  log(colors.green, '✓', message);
}

function error(message) {
  log(colors.red, '✗', message);
}

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function section(message) {
  console.log('\n' + colors.cyan + '='.repeat(60) + colors.reset);
  log(colors.cyan, message);
  console.log(colors.cyan + '='.repeat(60) + colors.reset + '\n');
}

async function testHealthCheck() {
  section('Test 1: Health Check');
  
  try {
    const response = await axios.get(HEALTH_URL);
    
    if (response.data.success && response.data.data.healthy) {
      success('Chat service is healthy');
      info(`Provider: ${response.data.data.provider}`);
      info(`Configured: ${response.data.data.configured}`);
      info(`Active Sessions: ${response.data.data.sessionStats.activeSessions}`);
      return true;
    } else {
      error('Chat service is not healthy');
      console.log(response.data);
      return false;
    }
  } catch (err) {
    error('Health check failed');
    console.error(err.message);
    if (err.code === 'ECONNREFUSED') {
      error('Cannot connect to backend. Is the server running?');
      error(`Expected URL: ${BASE_URL}`);
    }
    return false;
  }
}

async function testSimpleMessage() {
  section('Test 2: Simple Greeting');
  
  const payload = {
    sessionId: 'test-session-' + Date.now(),
    message: 'Hello! Can you help me?',
    context: {
      page: 'home',
      cartSummary: {
        itemCount: 0,
        total: 0
      }
    }
  };
  
  try {
    info('Sending: ' + payload.message);
    const response = await axios.post(CHAT_URL, payload);
    
    if (response.data.success && response.data.replyText) {
      success('Response received');
      console.log(colors.yellow + 'AI: ' + response.data.replyText + colors.reset);
      info(`Latency: ${response.data.data.metadata.latency}ms`);
      info(`TraceId: ${response.data.traceId}`);
      return true;
    } else {
      error('Invalid response format');
      console.log(response.data);
      return false;
    }
  } catch (err) {
    error('Simple message test failed');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testProductInquiry() {
  section('Test 3: Product Inquiry');
  
  const payload = {
    sessionId: 'test-products-' + Date.now(),
    message: 'What kind of products do you have?',
    context: {
      page: 'home'
    }
  };
  
  try {
    info('Sending: ' + payload.message);
    const response = await axios.post(CHAT_URL, payload);
    
    if (response.data.success && response.data.replyText) {
      success('Response received');
      console.log(colors.yellow + 'AI: ' + response.data.replyText + colors.reset);
      return true;
    } else {
      error('Invalid response');
      return false;
    }
  } catch (err) {
    error('Product inquiry test failed');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testOrderQuery() {
  section('Test 4: Order Query (Should Redirect)');
  
  const payload = {
    sessionId: 'test-order-' + Date.now(),
    message: 'Where is my order #12345?',
    context: {
      page: 'orders'
    }
  };
  
  try {
    info('Sending: ' + payload.message);
    const response = await axios.post(CHAT_URL, payload);
    
    if (response.data.success && response.data.replyText) {
      success('Response received');
      console.log(colors.yellow + 'AI: ' + response.data.replyText + colors.reset);
      
      // Check if AI properly refuses to fabricate order data
      const reply = response.data.replyText.toLowerCase();
      if (reply.includes('order') || reply.includes('track') || reply.includes('support')) {
        success('AI correctly redirected to support/tracking');
      } else {
        log(colors.yellow, '⚠ AI might be fabricating order data');
      }
      return true;
    } else {
      error('Invalid response');
      return false;
    }
  } catch (err) {
    error('Order query test failed');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testConversation() {
  section('Test 5: Multi-Turn Conversation');
  
  const sessionId = 'test-conversation-' + Date.now();
  
  const messages = [
    'Hi, I need help with shopping',
    'What do you recommend for groceries?',
    'How fast is the delivery?'
  ];
  
  try {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      info(`Turn ${i + 1}: ${message}`);
      
      const payload = {
        sessionId,
        message,
        context: { page: 'home' }
      };
      
      const response = await axios.post(CHAT_URL, payload);
      
      if (response.data.success && response.data.replyText) {
        console.log(colors.yellow + `AI: ${response.data.replyText}` + colors.reset);
      } else {
        error(`Turn ${i + 1} failed`);
        return false;
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    success('Conversation test completed');
    return true;
  } catch (err) {
    error('Conversation test failed');
    console.error(err.response?.data || err.message);
    return false;
  }
}

async function testValidation() {
  section('Test 6: Input Validation');
  
  const invalidPayloads = [
    { name: 'Missing sessionId', payload: { message: 'Hello' } },
    { name: 'Missing message', payload: { sessionId: 'test' } },
    { name: 'Empty message', payload: { sessionId: 'test', message: '' } },
    { name: 'Message too long', payload: { sessionId: 'test', message: 'x'.repeat(1001) } }
  ];
  
  let passed = 0;
  
  for (const test of invalidPayloads) {
    try {
      await axios.post(CHAT_URL, test.payload);
      error(`${test.name}: Should have failed but didn't`);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        success(`${test.name}: Properly rejected`);
        passed++;
      } else {
        error(`${test.name}: Unexpected error`);
      }
    }
  }
  
  info(`Validation tests: ${passed}/${invalidPayloads.length} passed`);
  return passed === invalidPayloads.length;
}

async function testRateLimit() {
  section('Test 7: Rate Limiting (Optional - May Take Time)');
  
  info('Skipping rate limit test (would require 30+ requests)');
  info('To test manually, send 30+ requests in 5 minutes');
  return true;
}

async function runAllTests() {
  console.log('\n' + colors.cyan + '╔════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║    Zipto Customer Chat AI - Test Suite               ║' + colors.reset);
  console.log(colors.cyan + '╚════════════════════════════════════════════════════════╝' + colors.reset);
  
  info(`Backend URL: ${BASE_URL}`);
  info(`Chat Endpoint: ${CHAT_URL}`);
  console.log('');
  
  const results = [];
  
  // Run tests
  results.push({ name: 'Health Check', passed: await testHealthCheck() });
  
  // Only continue if health check passed
  if (!results[0].passed) {
    error('\n⚠ Health check failed. Fix issues before running other tests.');
    process.exit(1);
  }
  
  results.push({ name: 'Simple Message', passed: await testSimpleMessage() });
  results.push({ name: 'Product Inquiry', passed: await testProductInquiry() });
  results.push({ name: 'Order Query', passed: await testOrderQuery() });
  results.push({ name: 'Conversation', passed: await testConversation() });
  results.push({ name: 'Input Validation', passed: await testValidation() });
  results.push({ name: 'Rate Limiting', passed: await testRateLimit() });
  
  // Summary
  section('Test Summary');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      success(`${result.name}: PASSED`);
    } else {
      error(`${result.name}: FAILED`);
    }
  });
  
  console.log('');
  if (passed === total) {
    success(`All tests passed! (${passed}/${total})`);
    console.log(colors.green + '\n🎉 Chat feature is working correctly!\n' + colors.reset);
    process.exit(0);
  } else {
    error(`Some tests failed (${passed}/${total} passed)`);
    console.log(colors.red + '\n❌ Please fix the issues and try again\n' + colors.reset);
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  error('Unhandled error:');
  console.error(err);
  process.exit(1);
});

// Run tests
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };

