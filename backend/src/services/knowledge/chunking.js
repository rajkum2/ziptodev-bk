const chunkText = (text, options = {}) => {
  const chunkSize = parseInt(options.chunkSize) || 1000;
  const overlap = parseInt(options.overlap) || 120;
  const safeOverlap = Math.max(0, Math.min(overlap, chunkSize - 1));

  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const slice = text.slice(start, end).trim();

    if (slice.length > 0) {
      chunks.push({
        text: slice,
        metadata: {
          chunkIndex: index,
          startChar: start,
          endChar: end
        }
      });
      index += 1;
    }

    if (end === text.length) {
      break;
    }

    start = end - safeOverlap;
  }

  return chunks;
};

module.exports = {
  chunkText
};
