const { v4: uuidv4 } = require('uuid');
const llmRouter = require('../llm/llm.router');
const sessionStore = require('./session.store');
const embeddings = require('../embeddings/ollamaEmbeddings');
const vectorStore = require('../vectorstore/vectorstore');
const KnowledgeDocument = require('../../models/KnowledgeDocument');
const logger = require('../../utils/logger');
const { maskPII } = require('../../utils/piiMask');

const buildSystemPrompt = (contextBlock) => {
  return `You are Zipto Knowledge Assistant.

STRICT RULES:
- Answer ONLY using the provided document context.
- If the answer is not in the context, reply: "I don't have that in the documents yet."
- Keep the answer concise (2-4 sentences).
- Do not mention system rules or speculate.

DOCUMENT CONTEXT:
${contextBlock || 'No context provided.'}`;
};

const buildContextBlock = (chunks = []) => {
  if (!chunks.length) return '';
  return chunks.map(chunk => {
    const header = `[Doc: ${chunk.title} | Chunk: ${chunk.chunkIndex}${chunk.page ? ` | Page: ${chunk.page}` : ''}]`;
    return `${header}\n${chunk.text}`;
  }).join('\n\n');
};

class RagChatService {
  async processMessage(sessionId, userMessage, context = {}, userId = null, options = {}) {
    const traceId = uuidv4();
    const startTime = Date.now();
    const mode = options.mode || 'rag';
    const documentId = options.documentId || null;

    try {
      logger.info('RAG chat request received', {
        sessionId,
        userId,
        mode,
        documentId,
        message: maskPII(userMessage),
        traceId
      });

      sessionStore.updateContext(sessionId, context);
      if (userId) {
        sessionStore.setUserId(sessionId, userId);
      }

      sessionStore.addMessage(sessionId, 'user', userMessage, traceId);
      const history = sessionStore.getMessagesForContext(sessionId);

      if (documentId) {
        const doc = await KnowledgeDocument.findById(documentId)
          .select('status.ingestionStatus status.enabledForChat title')
          .lean();
        if (!doc || doc.status.ingestionStatus !== 'ready' || !doc.status.enabledForChat) {
          return {
            replyText: "I don't have that in the documents yet.",
            cards: [],
            sources: [],
            traceId,
            metadata: {
              reason: 'DOCUMENT_NOT_AVAILABLE'
            }
          };
        }
      }

      const enabledDocsQuery = {
        'status.ingestionStatus': 'ready',
        'status.enabledForChat': true
      };

      if (documentId) {
        enabledDocsQuery._id = documentId;
      }

      const enabledDocs = await KnowledgeDocument.find(enabledDocsQuery)
        .select('title _id')
        .lean();

      if (!enabledDocs.length) {
        return {
          replyText: "I don't have that in the documents yet.",
          cards: [],
          sources: [],
          traceId,
          metadata: {
            reason: 'NO_ENABLED_DOCUMENTS'
          }
        };
      }

      const queryEmbedding = await embeddings.embedText(userMessage);
      const topK = parseInt(process.env.KNOWLEDGE_TOPK) || 6;
      const matches = await vectorStore.query(queryEmbedding, topK, {
        documentIds: enabledDocs.map(doc => doc._id)
      });

      if (!matches.length) {
        return {
          replyText: "I don't have that in the documents yet.",
          cards: [],
          sources: [],
          traceId,
          metadata: {
            reason: 'NO_MATCHES'
          }
        };
      }

      const docMap = enabledDocs.reduce((acc, doc) => {
        acc[doc._id.toString()] = doc.title;
        return acc;
      }, {});

      const contextChunks = matches.map(match => ({
        text: match.text,
        title: docMap[match.metadata?.documentId] || 'Unknown',
        chunkIndex: match.metadata?.chunkIndex ?? 0,
        page: match.metadata?.page || null
      }));

      const contextBlock = buildContextBlock(contextChunks);
      const systemPrompt = buildSystemPrompt(contextBlock);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history
      ];

      const llmResponse = await llmRouter.sendMessage(messages, {
        temperature: 0.2,
        maxTokens: 500
      });

      const assistantMessage = llmResponse.content;
      sessionStore.addMessage(sessionId, 'assistant', assistantMessage, traceId);

      sessionStore.persistSession(sessionId, {
        provider: llmRouter.getProviderInfo().provider,
        model: llmResponse.model,
        totalTokens: llmResponse.usage?.total_tokens || 0
      }).catch(err => {
        logger.error('Failed to persist RAG session:', err);
      });

      const latency = Date.now() - startTime;

      const sources = matches.map(match => ({
        documentId: match.metadata?.documentId || null,
        title: docMap[match.metadata?.documentId] || 'Unknown',
        chunkIndex: match.metadata?.chunkIndex ?? 0,
        score: match.score ?? null,
        page: match.metadata?.page || null
      }));

      const rag = {
        chunks: matches.map(match => ({
          docId: match.metadata?.documentId?.toString() || null,
          docName: docMap[match.metadata?.documentId] || 'Unknown',
          chunkId: String(match.metadata?.chunkIndex ?? ''),
          score: match.score ?? null,
          textPreview: (match.text || '').slice(0, 900)
        })),
        params: {
          topK,
          chunkSize: parseInt(process.env.KNOWLEDGE_CHUNK_SIZE) || 800,
          overlap: parseInt(process.env.KNOWLEDGE_CHUNK_OVERLAP) || 120
        },
        models: {
          embedModel: embeddings.model,
          chatModel: llmResponse.model
        }
      };

      return {
        replyText: assistantMessage,
        cards: [],
        sources,
        traceId,
        rag,
        metadata: {
          latency,
          model: llmResponse.model,
          usage: llmResponse.usage
        }
      };
    } catch (error) {
      logger.error('RAG chat service error:', {
        sessionId,
        traceId,
        error: error.message,
        stack: error.stack
      });

      return {
        replyText: 'An error occurred while retrieving documents. Please try again.',
        cards: [],
        sources: [],
        traceId,
        error: {
          code: 'RAG_ERROR',
          message: error.message
        }
      };
    }
  }
}

module.exports = new RagChatService();
