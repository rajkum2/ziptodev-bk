const mongoose = require('mongoose');

const knowledgeDocumentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalFileName: {
    type: String,
    required: true,
    trim: true
  },
  fileType: {
    type: String,
    enum: ['txt', 'md', 'pdf', 'docx'],
    required: true
  },
  storage: {
    storageDriver: {
      type: String,
      enum: ['local', 's3'],
      default: 'local'
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    }
  },
  status: {
    ingestionStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'ready', 'failed'],
      default: 'uploaded',
      index: true
    },
    errorMessage: {
      type: String,
      default: null
    },
    enabledForChat: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  stats: {
    pageCount: {
      type: Number
    },
    chunkCount: {
      type: Number,
      default: 0
    },
    embeddingModel: {
      type: String
    }
  },
  createdByAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

knowledgeDocumentSchema.index({ title: 'text', originalFileName: 'text' });

module.exports = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
