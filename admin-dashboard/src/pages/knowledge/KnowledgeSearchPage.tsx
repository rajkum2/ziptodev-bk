import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { listDocuments, searchKnowledge } from '../../api/knowledge';
import { useAuth } from '../../contexts/AuthContext';

const KnowledgeSearchPage = () => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('KNOWLEDGE_MANAGE');
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(6);
  const [documentId, setDocumentId] = useState('');

  const { data: docsData } = useQuery({
    queryKey: ['knowledge-documents-select'],
    queryFn: () => listDocuments({ page: 1, limit: 200 })
  });

  const searchMutation = useMutation({
    mutationFn: () => searchKnowledge({
      query,
      topK,
      documentId: documentId || undefined
    })
  });

  if (!canManage) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Knowledge Search</h1>
        <p className="text-gray-600 mt-2">You do not have permission to search knowledge documents.</p>
      </div>
    );
  }

  const documents = docsData?.data || [];
  const results = searchMutation.data?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Search</h1>
        <p className="text-gray-600 mt-1">Test retrieval results against stored embeddings.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Enabled Documents</option>
            {documents.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.title}</option>
            ))}
          </select>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {[3, 5, 6, 8, 10].map((k) => (
              <option key={k} value={k}>Top {k}</option>
            ))}
          </select>
          <button
            onClick={() => searchMutation.mutate()}
            disabled={!query || searchMutation.isPending}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">Results</h2>
        {searchMutation.isPending ? (
          <p className="text-gray-500">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-500">No results yet.</p>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={`${result.documentId}-${index}`} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{result.title}</p>
                    <p className="text-xs text-gray-500">Chunk {result.chunkIndex}{result.page ? ` • Page ${result.page}` : ''}</p>
                  </div>
                  <span className="text-sm text-gray-600">Score: {result.score?.toFixed(3) ?? 'n/a'}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {result.text.slice(0, 240)}{result.text.length > 240 ? '…' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeSearchPage;
