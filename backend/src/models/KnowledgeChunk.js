const mongoose = require('mongoose');

const knowledgeChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeDocument',
    required: true,
    index: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  metadata: {
    page: {
      type: Number
    },
    heading: {
      type: String
    },
    startChar: {
      type: Number
    },
    endChar: {
      type: Number
    }
  },
  vectorId: {
    type: String
  }
}, {
  timestamps: true
});

knowledgeChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
