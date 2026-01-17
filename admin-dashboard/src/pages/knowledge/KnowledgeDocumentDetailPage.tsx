import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { deleteDocument, getDocument, listChunks, reindexDocument, updateDocument } from '../../api/knowledge';
import { useAuth } from '../../contexts/AuthContext';

const KnowledgeDocumentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);

  const canManage = hasPermission('KNOWLEDGE_MANAGE');

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-document', id],
    queryFn: () => getDocument(id as string),
    enabled: !!id
  });

  const { data: chunkData, isLoading: chunksLoading } = useQuery({
    queryKey: ['knowledge-chunks', id, page],
    queryFn: () => listChunks(id as string, { page, limit: 10 }),
    enabled: !!id
  });

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => updateDocument(id as string, { enabledForChat: enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge-document', id] })
  });

  const reindexMutation = useMutation({
    mutationFn: () => reindexDocument(id as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge-document', id] })
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDocument(id as string),
    onSuccess: () => navigate('/knowledge/documents')
  });

  if (!canManage) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Document Details</h1>
        <p className="text-gray-600 mt-2">You do not have permission to view this document.</p>
      </div>
    );
  }

  if (isLoading || !data?.data) {
    return <div className="text-gray-500">Loading document...</div>;
  }

  const doc = data.data;
  const chunks = chunkData?.data || [];
  const pagination = chunkData?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{doc.title}</h1>
          <p className="text-gray-600 mt-1">{doc.originalFileName}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleMutation.mutate(!doc.status.enabledForChat)}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            {doc.status.enabledForChat ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
            {doc.status.enabledForChat ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Re-index this document?')) {
                reindexMutation.mutate();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <RefreshCcw className="w-4 h-4" />
            Reindex
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this document? This cannot be undone.')) {
                deleteMutation.mutate();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">{doc.status.ingestionStatus}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Chunks</p>
          <p className="font-medium">{doc.stats?.chunkCount || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Embedding Model</p>
          <p className="font-medium">{doc.stats?.embeddingModel || 'n/a'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created By</p>
          <p className="font-medium">{doc.createdByAdminId?.username || 'n/a'}</p>
        </div>
        {doc.status.errorMessage && (
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Error</p>
            <p className="text-red-600">{doc.status.errorMessage}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Chunks Preview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Index</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Snippet</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {chunksLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading chunks...</td>
                </tr>
              ) : chunks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">No chunks available</td>
                </tr>
              ) : (
                chunks.map((chunk) => (
                  <tr key={chunk._id}>
                    <td className="px-6 py-4 text-sm text-gray-700">{chunk.chunkIndex}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {chunk.text.slice(0, 160)}{chunk.text.length > 160 ? '…' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{chunk.metadata?.page ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
            <p className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeDocumentDetailPage;
