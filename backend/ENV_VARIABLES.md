# Environment Variables Configuration

This file documents all environment variables needed for the Zipto backend.

Copy these to your `.env` file and update the values accordingly.

## Core Server Configuration

```env
NODE_ENV=development
PORT=5000
```

## Database Configuration

```env
# MongoDB Atlas connection string (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zipto?retryWrites=true&w=majority
```

## JWT Authentication

```env
# JWT secrets (REQUIRED)
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here

# Admin JWT (REQUIRED)
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here
ADMIN_JWT_EXPIRES_IN=7d
```

## CORS Configuration

```env
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Rate Limiting

```env
# General API rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Redis (Optional)

```env
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
```

## File Uploads

```env
# Upload driver: local | s3 | cloudinary
UPLOAD_DRIVER=local
```

### Cloudinary Configuration (Optional)

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### AWS S3 Configuration (Optional)

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=
```

## Socket.io Configuration

```env
SOCKET_CORS_ORIGINS=http://localhost:5173
```

## Logging

```env
LOG_LEVEL=info
```

---

## 🤖 Customer Chat AI Configuration

### Provider Selection

```env
# Choose AI provider: deepseek_api | local_llm
AI_PROVIDER=local_llm

# Support-only mode (bypass AI/RAG for /api/chat/message)
SUPPORT_CHAT_ONLY=false
```

### Session Management

```env
# Maximum number of messages to keep in session history
SESSION_HISTORY_LIMIT=12

# Whether to persist chat sessions to MongoDB
# Set to 'false' to disable persistence
PERSIST_CHAT_SESSIONS=true
```

### Chat Rate Limiting

```env
# Rate limit window in milliseconds (default: 5 minutes)
CHAT_RATE_LIMIT_WINDOW_MS=300000

# Maximum requests per window (default: 30)
CHAT_RATE_LIMIT_MAX=30
```

### LLM Request Timeout

```env
# Timeout for LLM requests in milliseconds (default: 30 seconds)
LLM_TIMEOUT_MS=30000
```

---

## 🌐 DeepSeek API Configuration

**Use these when `AI_PROVIDER=deepseek_api`**

```env
# Your DeepSeek API key (get from https://platform.deepseek.com)
DEEPSEEK_API_KEY=your-deepseek-api-key-here

# DeepSeek API base URL (default shown)
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1

# Model to use (default shown)
DEEPSEEK_MODEL=deepseek-chat
```

### Getting a DeepSeek API Key

1. Visit https://platform.deepseek.com
2. Sign up or log in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to `DEEPSEEK_API_KEY`

---

## 🖥️ Local LLM Configuration

**Use these when `AI_PROVIDER=local_llm`**

```env
# URL of your local LLM server
LOCAL_LLM_BASE_URL=http://localhost:8000

# Model name to use
LOCAL_LLM_MODEL=deepseek-chat

# Compatibility mode: openai | ollama | vllm
LOCAL_LLM_COMPAT_MODE=openai
```

---

## 📚 Knowledge Base RAG (Step 2)

```env
# Ollama (embeddings + chat)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=deepseek-r1:latest
OLLAMA_EMBED_MODEL=nomic-embed-text

# Vector store (local)
VECTOR_STORE_DRIVER=chroma
VECTOR_STORE_PATH=./data/vectorstore
CHROMA_BASE_URL=http://localhost:8001

# Knowledge uploads
KNOWLEDGE_UPLOAD_DIR=./uploads/knowledge
KNOWLEDGE_MAX_FILE_MB=10
KNOWLEDGE_TOPK=6
KNOWLEDGE_CHUNK_SIZE=1000
KNOWLEDGE_CHUNK_OVERLAP=120
```

### Local LLM Server Options

#### Option 1: vLLM (Recommended)

```bash
# Install vLLM
pip install vllm

# Run server
python -m vllm.entrypoints.openai.api_server \
  --model deepseek-ai/DeepSeek-R1-Distill-Llama-8B \
  --host 0.0.0.0 \
  --port 8000
```

Configuration:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:8000
LOCAL_LLM_MODEL=deepseek-ai/DeepSeek-R1-Distill-Llama-8B
LOCAL_LLM_COMPAT_MODE=openai
```

#### Option 2: Ollama (Easiest)

```bash
# Install from https://ollama.ai

# Pull model
ollama pull deepseek-r1:latest

# Server runs automatically
```

Configuration:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-r1:latest
LOCAL_LLM_COMPAT_MODE=ollama
```

#### Option 3: Text Generation Inference (TGI)

```bash
# Run with Docker
docker run --gpus all --shm-size 1g -p 8000:80 \
  -v $PWD/data:/data \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id deepseek-ai/DeepSeek-R1-Distill-Llama-8B
```

Configuration:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:8000
LOCAL_LLM_MODEL=deepseek-ai/DeepSeek-R1-Distill-Llama-8B
LOCAL_LLM_COMPAT_MODE=openai
```

---

## 📋 Complete .env Template

Here's a complete `.env` file template with all variables:

```env
# ===================================
# CORE CONFIGURATION
# ===================================
NODE_ENV=development
PORT=5000

# ===================================
# DATABASE
# ===================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zipto?retryWrites=true&w=majority

# ===================================
# JWT AUTHENTICATION
# ===================================
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-key-here
ADMIN_JWT_EXPIRES_IN=7d

# ===================================
# CORS
# ===================================
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# ===================================
# RATE LIMITING
# ===================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===================================
# UPLOADS
# ===================================
UPLOAD_DRIVER=local

# ===================================
# SOCKET.IO
# ===================================
SOCKET_CORS_ORIGINS=http://localhost:5173

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=info

# ===================================
# CUSTOMER CHAT AI
# ===================================
AI_PROVIDER=local_llm
SUPPORT_CHAT_ONLY=false
SESSION_HISTORY_LIMIT=12
PERSIST_CHAT_SESSIONS=true
CHAT_RATE_LIMIT_WINDOW_MS=300000
CHAT_RATE_LIMIT_MAX=30
LLM_TIMEOUT_MS=30000

# ===================================
# DEEPSEEK API (when AI_PROVIDER=deepseek_api)
# ===================================
DEEPSEEK_API_KEY=
DEEPSEEK_API_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# ===================================
# LOCAL LLM (when AI_PROVIDER=local_llm)
# ===================================
LOCAL_LLM_BASE_URL=http://localhost:8000
LOCAL_LLM_MODEL=deepseek-chat
LOCAL_LLM_COMPAT_MODE=openai

# ===================================
# OPTIONAL: REDIS
# ===================================
# REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=

# ===================================
# OPTIONAL: CLOUDINARY
# ===================================
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=

# ===================================
# OPTIONAL: AWS S3
# ===================================
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=us-east-1
# AWS_S3_BUCKET=
```

---

## 🚀 Quick Start Configurations

### Development (Local LLM with Ollama)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=dev-jwt-secret
ADMIN_JWT_SECRET=dev-admin-jwt-secret
CORS_ORIGINS=http://localhost:5173

AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-r1:latest
LOCAL_LLM_COMPAT_MODE=ollama
```

### Development (DeepSeek API)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=dev-jwt-secret
ADMIN_JWT_SECRET=dev-admin-jwt-secret
CORS_ORIGINS=http://localhost:5173

AI_PROVIDER=deepseek_api
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_MODEL=deepseek-chat
```

### Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-production-jwt-secret
ADMIN_JWT_SECRET=strong-production-admin-jwt-secret
CORS_ORIGINS=https://yourdomain.com

AI_PROVIDER=deepseek_api
DEEPSEEK_API_KEY=your-production-api-key
DEEPSEEK_MODEL=deepseek-chat
LOG_LEVEL=error
```

---

## ✅ Validation Checklist

Before starting the server, ensure you have configured:

- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - JWT secret key
- [ ] `ADMIN_JWT_SECRET` - Admin JWT secret key
- [ ] `AI_PROVIDER` - Choose deepseek_api or local_llm
- [ ] If using DeepSeek API: `DEEPSEEK_API_KEY`
- [ ] If using Local LLM: `LOCAL_LLM_BASE_URL` and ensure server is running

---

## 🔧 Troubleshooting

### "Missing required environment variables"

Make sure you have set at minimum:
- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`

### "Cannot connect to local LLM server"

1. Check if your LLM server is running
2. Verify `LOCAL_LLM_BASE_URL` is correct
3. Test with: `curl http://localhost:8000/health` or `curl http://localhost:11434/api/tags`

### "Invalid DeepSeek API key"

1. Verify you copied the API key correctly
2. Check if the API key is active on DeepSeek platform
3. Ensure no extra spaces in the `.env` file

---

For more information, see the main README.md file.

