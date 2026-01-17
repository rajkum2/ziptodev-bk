# Zipto Admin Platform


**"Get everything in 10 min"**

Complete Admin Dashboard + Backend API for the Zipto quick-commerce platform.

## 🚀 Features

- **Full REST API** with Node.js + Express + MongoDB Atlas
- **Admin Dashboard** with React + TypeScript + TailwindCSS
- **Real-time Updates** via Socket.io for orders and delivery tracking
- **RBAC** (Role-Based Access Control) for admin users
- **Image Uploads** with pluggable storage adapters
- **Analytics & Reports** with comprehensive insights
- **Production-Ready** with logging, validation, and error handling

## 📦 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB Atlas + Mongoose ODM
- JWT Authentication
- Socket.io for real-time events
- Multer for file uploads
- Express Validator
- Morgan logging
- Node-cron for scheduled jobs

### Admin Dashboard
- React 18 + TypeScript
- TailwindCSS + shadcn/ui
- React Router
- TanStack Table
- Chart.js for analytics
- React Query
- Socket.io Client

## 📁 Project Structure

```
zipto-admin-platform/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database, Redis, Cloudinary configs
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── middlewares/ # Auth, validation, error handling
│   │   ├── validators/  # Request validators
│   │   ├── socket/      # Socket.io handlers
│   │   ├── jobs/        # Cron jobs
│   │   ├── utils/       # Utilities
│   │   └── admin/       # Admin-specific endpoints
│   ├── seed/            # Seed scripts and data
│   ├── uploads/         # Local file uploads (dev)
│   └── logs/            # Application logs
│
├── admin-dashboard/     # React Admin UI
│   ├── src/
│   │   ├── api/         # API client layer
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── layouts/     # Layout components
│   │   ├── hooks/       # Custom hooks
│   │   ├── store/       # State management
│   │   └── utils/       # Utilities
│   └── public/          # Static assets
│
└── README.md            # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account and cluster
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Zipto-Admin
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Configure your MongoDB Atlas connection string in `.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/zipto?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
ADMIN_JWT_SECRET=your-admin-jwt-secret-here
CORS_ORIGINS=http://localhost:5173
UPLOAD_DRIVER=local
SOCKET_CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=info
```

**Important:** Replace `<username>`, `<password>`, and `<cluster>` with your MongoDB Atlas credentials.

### 3. Seed the Database

```bash
npm run seed
```

This will populate your MongoDB Atlas database with:
- 1 super admin (username: `admin`, password: `Admin@123`)
- 10 categories
- 60 products with variants
- 5 shelves and 5 banners
- 100 users
- 50 orders
- 20 delivery partners
- Serviceable locations
- Analytics events

### 4. Start Backend Server

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 5. Admin Dashboard Setup

Open a new terminal:

```bash
cd admin-dashboard
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Configure API URLs in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 6. Start Admin Dashboard

```bash
npm run dev
```

Dashboard will run on `http://localhost:5173`

## 👤 Default Admin Credentials

After seeding the database:

- **Username:** `admin`
- **Password:** `Admin@123`

## 📚 API Documentation

### Base URL
`http://localhost:5000/api`

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {...},
  "message": "Success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Main API Endpoints

#### Authentication
- `POST /api/auth/send-otp` - Send OTP to customer
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get admin profile

#### Products
- `GET /api/products` - List products (with filters)
- `GET /api/products/:slug` - Get product details
- `GET /api/products/category/:categorySlug` - Products by category
- `GET /api/products/search` - Search products
- `POST /api/admin/products` - Create product (Admin)
- `PUT /api/admin/products/:id` - Update product (Admin)
- `DELETE /api/admin/products/:id` - Delete product (Admin)

#### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List user orders
- `GET /api/orders/:orderId` - Get order details
- `GET /api/admin/orders` - List all orders (Admin)
- `PATCH /api/admin/orders/:orderId/status` - Update order status (Admin)
- `PATCH /api/admin/orders/:orderId/assign-partner` - Assign delivery partner (Admin)

#### Categories
- `GET /api/categories` - List categories
- `POST /api/admin/categories` - Create category (Admin)
- `PUT /api/admin/categories/:id` - Update category (Admin)

#### Analytics (Admin)
- `GET /api/admin/analytics/overview` - Dashboard overview
- `GET /api/admin/analytics/sales` - Sales analytics
- `GET /api/admin/analytics/products` - Product performance
- `GET /api/admin/reports/export` - Export reports

See full API documentation in `/backend/docs/API.md`

## 🔌 Real-time Events (Socket.io)

### Events Emitted by Server
- `order:created` - New order placed
- `order:status_changed` - Order status updated
- `order:assigned` - Order assigned to delivery partner
- `partner:location_update` - Partner location updated
- `new:order` - Admin notification for new order

### Client Subscription (Admin Dashboard)
```javascript
socket.on('new:order', (order) => {
  // Update orders table
});

socket.on('order:status_changed', ({ orderId, status }) => {
  // Update order status in UI
});
```

## 🧪 Development Tools

### Simulate Real-time Events

The admin dashboard includes a "Dev Simulator" panel to test real-time features:
- Simulate new orders
- Update order statuses
- Move delivery partners on map

### API Testing

Use the provided Postman collection in `/backend/docs/Zipto-API.postman_collection.json`

## 🏗️ Database Models

### Core Collections

1. **users** - Customer accounts
2. **categories** - Product categories
3. **products** - Products with variants
4. **orders** - Customer orders
5. **banners** - Homepage banners
6. **shelves** - Product shelves/collections
7. **serviceable_locations** - Delivery areas
8. **admins** - Admin users
9. **delivery_partners** - Delivery personnel
10. **notifications** - User notifications
11. **analytics_events** - Analytics tracking

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-Based Access Control (RBAC)
- Rate limiting on auth endpoints
- Helmet security headers
- CORS configuration
- Input validation and sanitization
- Audit logging for sensitive operations

## 📊 Admin Dashboard Modules

1. **Dashboard Overview** - Key metrics and charts
2. **Orders Management** - View, filter, and manage orders
3. **Products Management** - CRUD operations for products
4. **Categories Management** - Manage product categories
5. **Inventory Management** - Stock tracking
6. **Users Management** - Customer management
7. **Delivery Partners** - Partner management and tracking
8. **Banners & Promotions** - Homepage content management
9. **Location & Serviceability** - Delivery area configuration
10. **Analytics & Reports** - Business insights
11. **Knowledge Base** - Documents & RAG management
12. **Settings** - Platform configuration
13. **Admin Users & RBAC** - Admin management

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas IP whitelist includes your host
3. Deploy from `backend/` directory
4. Run seed script if needed

### Admin Dashboard Deployment (Vercel/Netlify)

1. Build the admin dashboard:
```bash
cd admin-dashboard
npm run build
```

2. Deploy `dist/` folder to your hosting platform
3. Configure environment variables in your hosting platform

### Backend (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string (required)
- `JWT_SECRET` - JWT secret key
- `JWT_REFRESH_SECRET` - Refresh token secret
- `ADMIN_JWT_SECRET` - Admin JWT secret
- `CORS_ORIGINS` - Allowed CORS origins
- `UPLOAD_DRIVER` - Upload driver (local/s3/cloudinary)
- `LOG_LEVEL` - Logging level (info/debug/error)

**Customer Chat AI Configuration:**
- `AI_PROVIDER` - LLM provider (deepseek_api | local_llm)
- `SESSION_HISTORY_LIMIT` - Max messages to keep in context (default: 12)
- `PERSIST_CHAT_SESSIONS` - Save chats to MongoDB (default: true)
- `CHAT_RATE_LIMIT_WINDOW_MS` - Chat rate limit window (default: 300000 = 5 min)
- `CHAT_RATE_LIMIT_MAX` - Max requests per window (default: 30)
- `LLM_TIMEOUT_MS` - LLM request timeout (default: 30000)

**For DeepSeek API Provider** (`AI_PROVIDER=deepseek_api`):
- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `DEEPSEEK_API_BASE_URL` - API base URL (default: https://api.deepseek.com/v1)
- `DEEPSEEK_MODEL` - Model name (default: deepseek-chat)

**For Local LLM Provider** (`AI_PROVIDER=local_llm`):
- `LOCAL_LLM_BASE_URL` - Local server URL (e.g., http://localhost:8000)
- `LOCAL_LLM_MODEL` - Model name
- `LOCAL_LLM_COMPAT_MODE` - Compatibility mode (openai/ollama/vllm)

## 🤖 Customer Chat AI (Step 1 - DeepSeek Local)

Zipto now includes an AI-powered customer chat feature using DeepSeek models for local-first deployment.

### Features

- **Simple Chat**: Conversational AI assistant for customer support
- **Session Management**: Maintains conversation context (last 12 messages)
- **Provider Abstraction**: Switch between DeepSeek API or local LLM server
- **Rate Limiting**: 30 requests per 5 minutes per IP
- **PII Masking**: Automatic masking of sensitive information in logs
- **Safety Guidelines**: Prevents fabrication of order/payment data

### Quick Start (Local LLM)

1. **Option A: Using DeepSeek API (Hosted)**

```bash
# Add to backend/.env
AI_PROVIDER=deepseek_api
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_MODEL=deepseek-chat
```

2. **Option B: Local LLM Server (vLLM/OpenAI-compatible)**

Install and run a local inference server:

```bash
# Example: Using vLLM with DeepSeek model
pip install vllm
vllm serve deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B --port 8000

# Or use Text Generation Inference, LocalAI, etc.
```

Update backend `.env`:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:8000
LOCAL_LLM_MODEL=deepseek-chat
LOCAL_LLM_COMPAT_MODE=openai
```

#### Option 2: Using Ollama (Local)

Install Ollama and run DeepSeek model:

```bash
# Install Ollama (macOS)
brew install ollama

# Pull DeepSeek model
ollama pull deepseek-r1:latest

# Start Ollama server
ollama serve
```

Update `.env`:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-r1:latest
LOCAL_LLM_COMPAT_MODE=ollama
```

#### Option 2: DeepSeek Hosted API

Use DeepSeek's cloud API (requires API key):

```env
AI_PROVIDER=deepseek_api
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_MODEL=deepseek-chat
```

Sign up at https://platform.deepseek.com to get an API key.

### 3. Start the Backend

The chat service will automatically initialize when you start the backend server:

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

The chat endpoint will be available at: `POST http://localhost:5000/api/chat/message`

### 4. Test the Chat API

Using curl:

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "userId": null,
    "message": "Hi, can you help me find products?",
    "context": {
      "page": "home",
      "cartSummary": {
        "itemCount": 0,
        "total": 0
      }
    }
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "replyText": "Hello! I'd be happy to help you find products. What are you looking for today?",
    "cards": [],
    "traceId": "abc-123-def",
    "metadata": {
      "latency": 1234,
      "model": "deepseek-chat",
      "usage": {
        "prompt_tokens": 50,
        "completion_tokens": 20,
        "total_tokens": 70
      }
    }
  },
  "message": "Success",
  "replyText": "...",
  "cards": [],
  "traceId": "..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "CHAT_ERROR",
    "message": "Error message"
  },
  "traceId": "uuid",
  "replyText": "User-friendly error message",
  "cards": []
}
```

### 3. Health Check

Check chat service status:

```bash
curl http://localhost:5000/api/chat/health
```

Response:
```json
{
  "success": true,
  "data": {
    "provider": "local_llm",
    "compatMode": "openai",
    "configured": true,
    "healthy": true,
    "sessionStats": {
      "activeSessions": 5,
      "historyLimit": 12,
      "persistToMongo": true
    }
  },
  "message": "Chat service is healthy"
}
```

### Local LLM Server Setup

#### Option 1: Using vLLM (Recommended for DeepSeek)

```bash
# Install vLLM
pip install vllm

# Run DeepSeek model with OpenAI-compatible API
python -m vllm.entrypoints.openai.api_server \
  --model deepseek-ai/DeepSeek-R1-Distill-Llama-8B \
  --host 0.0.0.0 \
  --port 8000
```

Then configure your `.env`:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:8000
LOCAL_LLM_MODEL=deepseek-ai/DeepSeek-R1-Distill-Llama-8B
LOCAL_LLM_COMPAT_MODE=openai
```

#### Option 2: Using Ollama (Easiest for Local Development)

```bash
# Install Ollama from https://ollama.ai

# Pull DeepSeek model
ollama pull deepseek-r1:latest

# Ollama runs automatically on localhost:11434
```

Then configure your `.env`:
```env
AI_PROVIDER=local_llm
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_MODEL=deepseek-r1:latest
LOCAL_LLM_COMPAT_MODE=ollama
```

#### Option 3: Using DeepSeek Hosted API

```bash
# Get your API key from https://platform.deepseek.com
```

Configure your `.env`:
```env
AI_PROVIDER=deepseek_api
DEEPSEEK_API_KEY=your-api-key-here
DEEPSEEK_MODEL=deepseek-chat
```

### Chat Behavior & Limitations (Step 1)

**Current Capabilities:**
- Friendly conversational assistance
- Product discovery guidance
- General Zipto platform help
- Session context awareness

**Current Limitations (by design):**
- ❌ No real order lookup (tells users to check Orders page)
- ❌ No payment processing (directs to support)
- ❌ No refund tools (directs to support)
- ❌ No RAG/knowledge base (coming in Step 2)
- ❌ No agentic tool calling (coming in Step 3)

**Safety Features:**
- PII detection and masking in logs
- Warns users not to share sensitive info
- Rate limiting (30 requests per 5 minutes)
- Session history limited to last 12 messages

### Switching Providers

To switch between providers, simply update `AI_PROVIDER` in `.env` and restart the server:

```bash
# For local LLM
AI_PROVIDER=local_llm

# For DeepSeek API
AI_PROVIDER=deepseek_api
```

No code changes needed!

### Monitoring & Debugging

View logs:
```bash
# Backend logs
tail -f backend/logs/combined.log

# Error logs
tail -f backend/logs/error.log
```

Check active sessions:
```bash
curl http://localhost:5000/api/chat/session/<sessionId>
```

Clear a session:
```bash
curl -X DELETE http://localhost:5000/api/chat/session/<sessionId>
```

### Adding to Your Frontend

The chat API is ready to integrate with any frontend. Example with fetch:

```javascript
async function sendChatMessage(sessionId, message, context) {
  const response = await fetch('http://localhost:5000/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      message,
      context: {
        page: 'product',
        cartSummary: { itemCount: 3, total: 450 }
      }
    })
  });
  
  const data = await response.json();
  return data.replyText; // or data.data.replyText
}
```

## 🧠 Knowledge Base RAG (Step 2 - Local First)

Step 2 adds a local-first Knowledge Base with document ingestion, embeddings (Ollama), and retrieval-augmented chat.

### What’s Included

- Admin upload + document lifecycle (upload, reindex, enable/disable, delete)
- Chunking + embeddings (Ollama `nomic-embed-text`)
- Local vector store (Chroma)
- RAG mode on existing `/api/chat/message` (no breaking changes)
- Admin debugging search + chunk preview

### Local Setup (RAG)

1. **Start Ollama + embeddings model**

```bash
ollama pull nomic-embed-text
ollama pull deepseek-r1:latest
ollama serve
```

2. **Start Chroma (local vector store)**

```bash
pip install chromadb
chroma run --path ./backend/data/vectorstore --host 0.0.0.0 --port 8001
```

3. **Update backend `.env`**

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=deepseek-r1:latest
OLLAMA_EMBED_MODEL=nomic-embed-text

VECTOR_STORE_DRIVER=chroma
VECTOR_STORE_PATH=./data/vectorstore
CHROMA_BASE_URL=http://localhost:8001

KNOWLEDGE_UPLOAD_DIR=./uploads/knowledge
KNOWLEDGE_MAX_FILE_MB=10
KNOWLEDGE_TOPK=6
KNOWLEDGE_CHUNK_SIZE=1000
KNOWLEDGE_CHUNK_OVERLAP=120
```

4. **Upload a document**

Go to Admin Dashboard → **Knowledge Base** → **Upload Document**.
Requires admin permission: `KNOWLEDGE_MANAGE`.

5. **Test chat in RAG mode**

```bash
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "rag-session-001",
    "message": "What is the refund policy?",
    "mode": "rag"
  }'
```

**Single document mode:**

```json
{
  "sessionId": "rag-session-002",
  "message": "Summarize this policy",
  "mode": "rag",
  "documentId": "DOCUMENT_ID_HERE"
}
```

### Troubleshooting (RAG)

- **Ollama not running:** `curl http://localhost:11434/api/tags`
- **Missing embed model:** `ollama pull nomic-embed-text`
- **Chroma connection issue:** verify `CHROMA_BASE_URL` + that Chroma is running
- **Vector store permission errors:** ensure `VECTOR_STORE_PATH` is writable

### Next Steps (Future Enhancements)

The chat feature is designed to be extended incrementally:

1. **Step 3 - Agentic Tools:**
   - Add order lookup tool
   - Add payment status tool
   - Add refund tool
   - Enable function calling

2. **Step 4 - AWS Bedrock Migration:**
   - Add Bedrock adapter
   - Deploy to AWS Lambda
   - Use Claude or other Bedrock models

All future steps will be append-only and won't break existing functionality!

### Troubleshooting Chat Feature

**Problem: "Cannot connect to local LLM server"**
- Solution: Ensure your local LLM server is running
- Check `LOCAL_LLM_BASE_URL` is correct
- Test with: `curl http://localhost:8000/health` (or `/v1/models`)

**Problem: "DeepSeek API key invalid"**
- Solution: Verify `DEEPSEEK_API_KEY` in `.env`
- Get a valid key from https://platform.deepseek.com

**Problem: "Rate limit exceeded"**
- Solution: Wait a few minutes or adjust `CHAT_RATE_LIMIT_MAX` in `.env`

**Problem: Chat responses are slow**
- Solution: Local LLMs can be slow on CPU
- Use GPU if available
- Or switch to `AI_PROVIDER=deepseek_api` for faster hosted API

---

## 🔌 Real-time Events (Socket.io)

### Events Emitted by Server
- `order:created` - New order placed
- `order:status_changed` - Order status updated
- `order:assigned` - Order assigned to delivery partner
- `partner:location_update` - Partner location updated
- `new:order` - Admin notification for new order

### Client Subscription (Admin Dashboard)
```javascript
socket.on('new:order', (order) => {
  // Update orders table
});

socket.on('order:status_changed', ({ orderId, status }) => {
  // Update order status in UI
});
```

## 🧪 Development Tools

### Simulate Real-time Events

The admin dashboard includes a "Dev Simulator" panel to test real-time features:
- Simulate new orders
- Update order statuses
- Move delivery partners on map

### API Testing

Use the provided Postman collection in `/backend/docs/Zipto-API.postman_collection.json`

## 🏗️ Database Models

### Core Collections

1. **users** - Customer accounts
2. **categories** - Product categories
3. **products** - Products with variants
4. **orders** - Customer orders
5. **banners** - Homepage banners
6. **shelves** - Product shelves/collections
7. **serviceable_locations** - Delivery areas
8. **admins** - Admin users
9. **delivery_partners** - Delivery personnel
10. **notifications** - User notifications
11. **analytics_events** - Analytics tracking
12. **chat_sessions** - AI chat conversations (NEW)

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-Based Access Control (RBAC)
- Rate limiting on auth endpoints
- Helmet security headers
- CORS configuration
- Input validation and sanitization
- Audit logging for sensitive operations
- PII masking in chat logs (NEW)

## 📊 Admin Dashboard Modules

1. **Dashboard Overview** - Key metrics and charts
2. **Orders Management** - View, filter, and manage orders
3. **Products Management** - CRUD operations for products
4. **Categories Management** - Manage product categories
5. **Inventory Management** - Stock tracking
6. **Users Management** - Customer management
7. **Delivery Partners** - Partner management and tracking
8. **Banners & Promotions** - Homepage content management
9. **Location & Serviceability** - Delivery area configuration
10. **Analytics & Reports** - Business insights
11. **Knowledge Base** - Documents & RAG management
12. **Settings** - Platform configuration
13. **Admin Users & RBAC** - Admin management

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas IP whitelist includes your host
3. Deploy from `backend/` directory
4. Run seed script if needed

### Admin Dashboard Deployment (Vercel/Netlify)

1. Build the admin dashboard:
```bash
cd admin-dashboard
npm run build
```

2. Deploy `dist/` folder to your hosting platform
3. Configure environment variables in your hosting platform

## 📝 Environment Variables

### Backend (.env)

**Core Configuration:**
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB Atlas connection string (required)
- `JWT_SECRET` - JWT secret key
- `JWT_REFRESH_SECRET` - Refresh token secret
- `ADMIN_JWT_SECRET` - Admin JWT secret
- `CORS_ORIGINS` - Allowed CORS origins
- `UPLOAD_DRIVER` - Upload driver (local/s3/cloudinary)
- `LOG_LEVEL` - Logging level (info/debug/error)

**Chat AI Configuration (NEW):**
- `AI_PROVIDER` - AI provider (local_llm | deepseek_api)
- `SESSION_HISTORY_LIMIT` - Max messages per session (default: 12)
- `PERSIST_CHAT_SESSIONS` - Save to MongoDB (default: true)
- `CHAT_RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 300000 = 5 min)
- `CHAT_RATE_LIMIT_MAX` - Max requests per window (default: 30)
- `LLM_TIMEOUT_MS` - LLM request timeout (default: 30000)

**DeepSeek API (when AI_PROVIDER=deepseek_api):**
- `DEEPSEEK_API_KEY` - Your DeepSeek API key
- `DEEPSEEK_API_BASE_URL` - API base URL (default: https://api.deepseek.com/v1)
- `DEEPSEEK_MODEL` - Model name (default: deepseek-chat)

**Local LLM (when AI_PROVIDER=local_llm):**
- `LOCAL_LLM_BASE_URL` - Local server URL (default: http://localhost:8000)
- `LOCAL_LLM_MODEL` - Model name
- `LOCAL_LLM_COMPAT_MODE` - Compatibility mode (openai | ollama | vllm)

**Knowledge Base RAG (Step 2):**
- `OLLAMA_BASE_URL` - Ollama base URL for embeddings/chat
- `OLLAMA_CHAT_MODEL` - Chat model name (Ollama)
- `OLLAMA_EMBED_MODEL` - Embedding model name (default: nomic-embed-text)
- `VECTOR_STORE_DRIVER` - Vector store driver (chroma)
- `VECTOR_STORE_PATH` - Local vector store path
- `CHROMA_BASE_URL` - Chroma server URL (default: http://localhost:8001)
- `KNOWLEDGE_UPLOAD_DIR` - Local uploads path for documents
- `KNOWLEDGE_MAX_FILE_MB` - Upload size limit
- `KNOWLEDGE_TOPK` - Retrieval top-k
- `KNOWLEDGE_CHUNK_SIZE` - Chunk size (chars)
- `KNOWLEDGE_CHUNK_OVERLAP` - Chunk overlap (chars)

### Admin Dashboard (.env)
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## 🐛 Troubleshooting

### MongoDB Atlas Connection Issues

1. Ensure IP address is whitelisted in MongoDB Atlas
2. Verify connection string format is correct
3. Check database user permissions
4. Test connection with MongoDB Compass

### CORS Errors

Update `CORS_ORIGINS` in backend `.env` to include your frontend URL

### Port Already in Use

Change `PORT` in backend `.env` or kill the process using the port:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: support@zipto.com

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ for Zipto - "Get everything in 10 min"


## 🐛 Troubleshooting

### MongoDB Atlas Connection Issues

1. Ensure IP address is whitelisted in MongoDB Atlas
2. Verify connection string format is correct
3. Check database user permissions
4. Test connection with MongoDB Compass

### CORS Errors

Update `CORS_ORIGINS` in backend `.env` to include your frontend URL

### Port Already in Use

Change `PORT` in backend `.env` or kill the process using the port:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: support@zipto.com

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ for Zipto - "Get everything in 10 min"

