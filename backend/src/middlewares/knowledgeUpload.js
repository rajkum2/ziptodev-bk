const multer = require('multer');
const path = require('path');
const ApiResponse = require('../utils/response');
const { buildSafeFileName, ensureDir } = require('../utils/fileSafe');

const getUploadDir = () => {
  if (process.env.KNOWLEDGE_UPLOAD_DIR) {
    return path.resolve(process.env.KNOWLEDGE_UPLOAD_DIR);
  }
  return path.join(__dirname, '../../uploads/knowledge');
};

const allowedExtensions = ['.txt', '.md', '.pdf', '.docx'];
const allowedMimeTypes = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream'
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = getUploadDir();
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, buildSafeFileName(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const isAllowedExt = allowedExtensions.includes(ext);
  const isAllowedMime = allowedMimeTypes.has(file.mimetype);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
    return;
  }

  cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
};

const maxFileSize = (() => {
  const maxMb = parseInt(process.env.KNOWLEDGE_MAX_FILE_MB) || 10;
  return maxMb * 1024 * 1024;
})();

const knowledgeUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize
  }
});

const handleKnowledgeUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.error(
        res,
        `File size exceeds the limit of ${process.env.KNOWLEDGE_MAX_FILE_MB || 10}MB`,
        'FILE_TOO_LARGE',
        400
      );
    }
    return ApiResponse.error(res, err.message, 'UPLOAD_ERROR', 400);
  }

  if (err) {
    return ApiResponse.error(res, err.message, 'UPLOAD_ERROR', 400);
  }

  next();
};

module.exports = {
  knowledgeUpload,
  handleKnowledgeUploadError
};
