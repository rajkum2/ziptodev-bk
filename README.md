# Zipto Admin Platform

**"Get everything in 10 min"**

Complete admin dashboard + backend API for the Zipto quick-commerce platform, including real-time operations, AI chat, knowledge base RAG, and support inbox workflows.

## What’s Included

- **Backend API**: Node.js + Express + MongoDB Atlas with RBAC, uploads, analytics, and jobs
- **Admin Dashboard**: React + TypeScript + TailwindCSS with full admin modules
- **Real-time**: Socket.io events for orders, partners, and support inbox
- **Customer Chat AI**: DeepSeek API or local LLM provider
- **Knowledge Base RAG**: Local-first ingestion + vector search
- **Support Inbox (Step 3)**: Conversations, assignment, and RAG tracing

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB Atlas + Mongoose
- JWT Authentication
- Socket.io
- Multer (uploads)
- Winston + Morgan (logging)
- Swagger (OpenAPI docs)

**Admin Dashboard**
- React 18 + TypeScript + Vite
- TailwindCSS + shadcn/ui
- React Router + React Query
- Chart.js
- Socket.io Client

## Project Structure

```
ziptodev-bk/
├── backend/                # Node.js + Express API
│   ├── src/                # API source
│   ├── seed/               # Seed scripts
│   ├── uploads/            # Local uploads (dev)
│   ├── logs/               # Log files (dev)
│   ├── CHAT_QUICKSTART.md
│   └── ENV_VARIABLES.md
├── admin-dashboard/        # React Admin UI
│   ├── src/
│   │   ├── api/             # API client + domain modules
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # Auth + Socket contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── layouts/         # Auth + Dashboard layouts
│   │   ├── pages/           # App screens (modules)
│   │   ├── App.tsx          # Routes
│   │   └── main.tsx         # Entry
│   ├── index.html
│   └── vite.config.ts
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- Git
- Optional for AI/RAG: Python 3.10+, Ollama, and/or Chroma

### 1) Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` (there is no `.env.example` in this repo):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/zipto?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
CORS_ORIGINS=http://localhost:5173
SOCKET_CORS_ORIGINS=http://localhost:5173
```

Full variable list and templates are in `backend/ENV_VARIABLES.md`.

### 2) Seed the Database (Optional for demo data)

```bash
cd backend
npm run seed
```

Seeded data includes:
- 1 super admin (`admin` / `Admin@123`)
- Categories, products, banners, shelves
- Users, orders, delivery partners
- Serviceable locations and analytics events

### 3) Start Backend Server

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`

### 4) Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
```

Create `admin-dashboard/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 5) Start Admin Dashboard

```bash
cd admin-dashboard
npm run dev
```

Dashboard runs at `http://localhost:5173`

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `Admin@123`

## API Documentation

- **Swagger UI:** `http://localhost:5000/api-docs`
- **Swagger JSON:** `http://localhost:5000/api-docs.json`
- **Health:** `http://localhost:5000/health`

Swagger specs are generated from `backend/src/docs`.

## Environment Variables (Backend)

The complete list is maintained in `backend/ENV_VARIABLES.md`. Highlights:

**Required**
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ADMIN_JWT_SECRET`

**Common**
- `NODE_ENV`, `PORT`
- `CORS_ORIGINS`, `SOCKET_CORS_ORIGINS`
- `LOG_LEVEL`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
- `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `ADMIN_JWT_EXPIRES_IN`

**Uploads**
- `UPLOAD_DRIVER` (local | cloudinary | s3)
- `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE`
- `CLOUDINARY_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`

**Orders & Auth**
- `DEFAULT_DELIVERY_FEE`, `FREE_DELIVERY_THRESHOLD`, `HANDLING_FEE`
- `OTP_EXPIRY_MINUTES`

**Cron / Jobs**
- `ENABLE_CRON=true` to enable jobs outside production

**Optional (Stubbed)**
- `REDIS_ENABLED`, `REDIS_URL`, `REDIS_PASSWORD` (adapter stub only)

**Chat AI**
- `AI_PROVIDER` (deepseek_api | local_llm)
- `SESSION_HISTORY_LIMIT`, `PERSIST_CHAT_SESSIONS`
- `CHAT_RATE_LIMIT_WINDOW_MS`, `CHAT_RATE_LIMIT_MAX`
- `LLM_TIMEOUT_MS`

**DeepSeek API**
- `DEEPSEEK_API_KEY`, `DEEPSEEK_API_BASE_URL`, `DEEPSEEK_MODEL`

**Local LLM**
- `LOCAL_LLM_BASE_URL`, `LOCAL_LLM_MODEL`, `LOCAL_LLM_COMPAT_MODE`
- `OLLAMA_BASE_URL`, `OLLAMA_CHAT_MODEL` (optional Ollama defaults)

**Knowledge Base RAG**
- `VECTOR_STORE_DRIVER`, `VECTOR_STORE_PATH`
- `CHROMA_BASE_URL`, `CHROMA_COLLECTION`
- `OLLAMA_EMBED_MODEL`
- `KNOWLEDGE_UPLOAD_DIR`, `KNOWLEDGE_MAX_FILE_MB`
- `KNOWLEDGE_TOPK`, `KNOWLEDGE_CHUNK_SIZE`, `KNOWLEDGE_CHUNK_OVERLAP`

## Environment Variables (Admin Dashboard)

- `VITE_API_BASE_URL`
- `VITE_SOCKET_URL`

## Scripts

**Backend**
- `npm run dev` - start with nodemon
- `npm run start` - start with node
- `npm run seed` - seed database
- `npm run seed:clear` - clear seed data

**Admin Dashboard**
- `npm run dev`
- `npm run build`
- `npm run preview`

## Core API Areas

- **Auth**: customer OTP login, admin login
- **Products/Categories/Shelves/Banners**: full CRUD
- **Orders**: order lifecycle + assignment
- **Locations**: serviceability
- **Partners**: delivery partner management
- **Analytics/Reports**: dashboard stats
- **Chat**: `POST /api/chat/message`
- **Support**: `/api/admin/support/*`

For the full list, use Swagger at `/api-docs`.

## Real-time Events (Socket.io)

Server events include:
- `order:created`
- `order:status_changed`
- `order:assigned`
- `partner:location_update`
- `new:order`
- `conversation:new_message`
- `conversation:updated`
- `conversation:assigned`
- `conversation:mode_changed`
- `conversation:closed`

## Customer Chat AI

- Endpoint: `POST /api/chat/message`
- Health: `GET /api/chat/health`
- Provider: DeepSeek API or local LLM
- Safety: PII masking, rate limits, restricted actions

Detailed steps and examples are in `backend/CHAT_QUICKSTART.md` and `CHAT_IMPLEMENTATION_SUMMARY.md`.

## Knowledge Base RAG (Step 2)

Local-first RAG uses Ollama embeddings + Chroma vector store. Admin UI supports upload, reindex, and search.

See `backend/ENV_VARIABLES.md` for full setup and commands.

## Support Inbox Module (Step 3)

Admin screens:
- `/support/conversations`
- `/support/conversations/:conversationId`
- `/support/rag-debug`

Permissions:
- `SUPPORT_VIEW`, `SUPPORT_MANAGE`, `SUPPORT_TAKEOVER`
- `SUPPORT_ASSIGN`, `SUPPORT_CLOSE`, `SUPPORT_RAG_DEBUG`

## Database Collections

Core collections:
- users, admins, categories, products, orders
- shelves, banners, serviceable_locations
- delivery_partners, notifications, analytics_events
- chat_sessions, knowledge_documents, knowledge_chunks
- conversations, conversation_messages, rag_traces

## Deployment Notes

**Backend**
- Set all required env vars
- Ensure MongoDB Atlas IP whitelist allows your host
- Configure uploads (local, Cloudinary, or S3)
- Expose `/api-docs` if you want public API docs

**Admin Dashboard**
- Update `VITE_API_BASE_URL` and `VITE_SOCKET_URL`
- Run `npm run build` and deploy `admin-dashboard/dist`

## Troubleshooting

- **MongoDB connection issues**: confirm IP whitelist + URI format
- **CORS errors**: update `CORS_ORIGINS`
- **Local LLM not reachable**: verify `LOCAL_LLM_BASE_URL`
- **Port in use**: change `PORT` or terminate the process

## Additional Docs

- `GETTING_STARTED.md` - Step-by-step setup
- `backend/ENV_VARIABLES.md` - Full env reference
- `backend/CHAT_QUICKSTART.md` - Chat setup
- `CHAT_IMPLEMENTATION_SUMMARY.md` - Chat/RAG implementation overview
- `PROJECT_SUMMARY.md` - High-level project summary

## License

MIT License - see `LICENSE`.

---

Built with ❤️ for Zipto - "Get everything in 10 min"

