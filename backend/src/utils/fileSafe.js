const path = require('path');
const fs = require('fs');

const sanitizeFilename = (name) => {
  const base = path.basename(name || 'file');
  const ext = path.extname(base);
  const raw = path.basename(base, ext);
  const safeBase = raw.replace(/[^a-zA-Z0-9._-]/g, '-').substring(0, 80) || 'file';
  return `${safeBase}${ext.toLowerCase()}`;
};

const buildSafeFileName = (originalName) => {
  const ext = path.extname(originalName || '').toLowerCase();
  const safeBase = sanitizeFilename(originalName).replace(ext, '');
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${safeBase}-${uniqueSuffix}${ext || ''}`;
};

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

module.exports = {
  sanitizeFilename,
  buildSafeFileName,
  ensureDir
};
