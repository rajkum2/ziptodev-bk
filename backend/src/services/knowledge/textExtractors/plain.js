const fs = require('fs').promises;

const extractPlainText = async (filePath) => {
  const text = await fs.readFile(filePath, 'utf-8');
  return {
    text,
    pageCount: null
  };
};

module.exports = {
  extractPlainText
};
