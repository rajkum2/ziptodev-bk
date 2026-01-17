# Customer Chat AI - Quick Start Guide

This guide will help you get the Customer Chat AI feature up and running in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas connection configured
- Backend dependencies installed (`npm install`)

## Step 1: Choose Your AI Provider

You have two options:

### Option A: DeepSeek API (Easiest, requires API key)
### Option B: Local LLM (Free, requires local server)

---

## Option A: DeepSeek API Setup (Recommended for Quick Start)

### 1. Get API Key

1. Visit https://platform.deepseek.com
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key

### 2. Configure Environment

Add to your `backend/.env`:

```env
AI_PROVIDER=deepseek_api
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_MODEL=deepseek-chat
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

### 4. Test It

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hello, can you help me?",
    "context": { "page": "home" }
  }'
```

**You should see a friendly response from the AI!**

---

## Option B: Local LLM Setup (Free, Best for Development)

### 1. Install Ollama (Easiest Local Option)

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com/download

### 2. Pull DeepSeek Model

```bash
ollama pull deepseek-r1:latest
```

This will download a ~5GB model (one-time download).

### 3. Start Ollama Server

```bash
ollama serve
```

Ollama will run on `http://localhost:11434`

### 4. Configure Environment

Add to your `backend/.env`:

```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-r1:latest
LOCAL_LLM_COMPAT_MODE=ollama
```

### 5. Start Backend

```bash
cd backend
npm run dev
```

### 6. Test It

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "message": "Hello!",
    "context": { "page": "home" }
  }'
```

---

## Verifying the Setup

### 1. Check Backend Health

```bash
curl http://localhost:5000/health
```

Expected: `{"success": true, "message": "Zipto API is running", ...}`

### 2. Check Chat Health

```bash
curl http://localhost:5000/api/chat/health
```

Expected output:
```json
{
  "success": true,
  "data": {
    "provider": "local_llm",
    "configured": true,
    "healthy": true,
    "sessionStats": {
      "activeSessions": 0,
      "historyLimit": 12,
      "persistToMongo": true
    }
  },
  "message": "Chat service is healthy"
}
```

### 3. Send a Test Message

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "userId": null,
    "message": "What is Zipto?",
    "context": {
      "page": "home",
      "cartSummary": {
        "itemCount": 0,
        "total": 0
      }
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "replyText": "Zipto is a quick commerce platform...",
    "cards": [],
    "traceId": "uuid-here",
    "metadata": {
      "latency": 1234,
      "model": "deepseek-r1:latest",
      "usage": { ... }
    }
  },
  "message": "Success",
  "replyText": "Zipto is a quick commerce platform...",
  "cards": [],
  "traceId": "uuid-here"
}
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to local LLM server"

**Solution:**
1. Make sure Ollama is running: `ollama serve`
2. Test Ollama: `curl http://localhost:11434/api/tags`
3. Check `LOCAL_LLM_BASE_URL` in `.env`

### Issue: "Invalid DeepSeek API key"

**Solution:**
1. Verify the API key in `.env`
2. Check for extra spaces or quotes
3. Ensure the key is active on DeepSeek platform

### Issue: "Rate limit exceeded"

**Solution:**
Wait a few minutes, or increase the limit in `.env`:
```env
CHAT_RATE_LIMIT_MAX=60
```

### Issue: Slow responses with local LLM

**Solution:**
- Local LLMs are slower on CPU
- Consider using GPU if available
- Or switch to `AI_PROVIDER=deepseek_api` for faster hosted API

---

## Testing Different Scenarios

### 1. Simple Greeting

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-1",
    "message": "Hi there!"
  }'
```

### 2. Product Discovery

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-2",
    "message": "I need help finding fresh vegetables",
    "context": { "page": "category" }
  }'
```

### 3. Order Query (Should Redirect to Support)

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-3",
    "message": "Where is my order #12345?",
    "context": { "page": "orders" }
  }'
```

Expected: AI should inform that order tools aren't connected yet and suggest checking the Orders page.

### 4. Conversation Context

Send multiple messages with the same `sessionId`:

```bash
# First message
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "conversation-1",
    "message": "What products do you have?"
  }'

# Follow-up (uses context from previous message)
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "conversation-1",
    "message": "And do you deliver to my area?"
  }'
```

The AI should maintain context across messages.

---

## Session Management

### View Session Stats

```bash
curl http://localhost:5000/api/chat/session/test-session-123
```

### Clear Session History

```bash
curl -X DELETE http://localhost:5000/api/chat/session/test-session-123
```

---

## Monitoring

### View Logs

```bash
# All logs
tail -f backend/logs/combined.log

# Errors only
tail -f backend/logs/error.log
```

### Check MongoDB for Chat Sessions

```javascript
// In MongoDB Compass or shell
db.chatsessions.find().sort({ createdAt: -1 }).limit(10)
```

---

## Next Steps

Once basic chat is working:

1. **Integrate with Frontend**: Use the API in your React/mobile app
2. **Customize System Prompt**: Edit `backend/src/services/chat/chat.service.js`
3. **Add RAG (Step 2)**: Integrate vector database for knowledge base
4. **Add Agentic Tools (Step 3)**: Enable order lookup, payments, etc.
5. **Deploy to Production**: Use DeepSeek API or AWS Bedrock

---

## Production Checklist

Before deploying to production:

- [ ] Use `AI_PROVIDER=deepseek_api` (or AWS Bedrock in future)
- [ ] Set strong `JWT_SECRET` and `ADMIN_JWT_SECRET`
- [ ] Configure proper `CORS_ORIGINS` for your domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable MongoDB persistence: `PERSIST_CHAT_SESSIONS=true`
- [ ] Set up monitoring and alerting
- [ ] Test rate limiting is working
- [ ] Verify PII masking in logs

---

## Getting Help

- Check `backend/ENV_VARIABLES.md` for all configuration options
- See `README.md` for full documentation
- View `backend/logs/` for error details

---

**You're all set! 🚀 The chat feature is now ready for integration with your frontend.**

