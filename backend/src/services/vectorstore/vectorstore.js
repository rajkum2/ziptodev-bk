const ChromaVectorStore = require('./chroma');

const driver = process.env.VECTOR_STORE_DRIVER || 'chroma';

let storeInstance = null;

const getVectorStore = () => {
  if (storeInstance) return storeInstance;

  switch (driver) {
    case 'chroma':
      storeInstance = new ChromaVectorStore();
      break;
    default:
      throw new Error(`Unsupported vector store driver: ${driver}`);
  }

  return storeInstance;
};

module.exports = getVectorStore();
