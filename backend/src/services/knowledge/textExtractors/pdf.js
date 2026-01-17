const fs = require('fs').promises;
const { PDFParse } = require('pdf-parse');

const extractPdfText = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  // Convert Buffer to Uint8Array (required by pdf-parse v2)
  const uint8Array = new Uint8Array(buffer);
  const pdf = new PDFParse(uint8Array);
  await pdf.load();
  const result = await pdf.getText();

  // pdf-parse v2 returns { pages: [], text: string, total: number }
  const extractedText = typeof result === 'string' ? result : (result?.text || '');
  const pageCount = typeof result === 'object' ? (result?.total || null) : null;

  return {
    text: extractedText,
    pageCount: pageCount
  };
};

module.exports = {
  extractPdfText
};
