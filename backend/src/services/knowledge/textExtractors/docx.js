const fs = require('fs').promises;
const mammoth = require('mammoth');

const extractDocxText = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });

  return {
    text: result.value || '',
    pageCount: null
  };
};

module.exports = {
  extractDocxText
};
