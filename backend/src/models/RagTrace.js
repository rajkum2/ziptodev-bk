const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ragTraceSchema = new mongoose.Schema({
  ragTraceId: {
    type: String,
    unique: true,
    index: true,
    default: () => uuidv4()
  },
  traceId: {
    type: String,
    index: true,
    default: null
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  messageId: {
    type: String,
    required: true,
    index: true
  },
  kbDocIds: [{
    type: String
  }],
  kbDocNames: [{
    type: String
  }],
  chunks: [{
    docId: String,
    docName: String,
    chunkId: String,
    score: Number,
    textPreview: String
  }],
  params: {
    topK: Number,
    chunkSize: Number,
    overlap: Number
  },
  models: {
    embedModel: String,
    chatModel: String
  },
  latencyMs: Number
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

ragTraceSchema.index({ conversationId: 1, createdAt: -1 });
ragTraceSchema.index({ messageId: 1 });
ragTraceSchema.index({ traceId: 1 });

module.exports = mongoose.model('RagTrace', ragTraceSchema);

