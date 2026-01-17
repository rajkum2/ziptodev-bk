import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, RefreshCcw, Trash2, Eye, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  deleteDocument,
  listDocuments,
  reindexDocument,
  updateDocument,
  uploadDocument,
  getDocument,
  KnowledgeDocument
} from '../../api/knowledge';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_OPTIONS = ['uploaded', 'processing', 'ready', 'failed'];

const KnowledgeDocumentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [enabledFilter, setEnabledFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const canManage = hasPermission('KNOWLEDGE_MANAGE');

  const queryKey = useMemo(() => ['knowledge-documents', { search, statusFilter, enabledFilter, page }], [
    search,
    statusFilter,
    enabledFilter,
    page
  ]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listDocuments({
      page,
      limit: 10,
      status: statusFilter || undefined,
      enabled: enabledFilter || undefined,
      search: search || undefined
    })
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, enabledFilter]);

  const documents = data?.data || [];
  const pagination = data?.pagination;

  const toggleMutation = useMutation({
    mutationFn: (doc: KnowledgeDocument) => updateDocument(doc._id, { enabledForChat: !doc.status.enabledForChat }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const reindexMutation = useMutation({
    mutationFn: (id: string) => reindexDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  if (!canManage) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600 mt-2">You do not have permission to manage knowledge documents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">Upload and manage documents for RAG mode.</p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search title or file name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 min-w-[220px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={enabledFilter}
          onChange={(e) => setEnabledFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Enabled (All)</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>
        <button
          onClick={() => setPage(1)}
          className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Apply
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Enabled</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Chunks</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading documents...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No documents found</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.title}</p>
                          <p className="text-xs text-gray-500">{doc.originalFileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{doc.fileType.toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status.ingestionStatus === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : doc.status.ingestionStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.status.ingestionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleMutation.mutate(doc)}
                        className="text-gray-600 hover:text-purple-600"
                        title="Toggle enabled"
                      >
                        {doc.status.enabledForChat ? (
                          <ToggleRight className="w-6 h-6 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{doc.stats?.chunkCount || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(doc.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/knowledge/documents/${doc._id}`)}
                          className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Re-index this document?')) {
                              reindexMutation.mutate(doc._id);
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Re-index"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this document? This cannot be undone.')) {
                              deleteMutation.mutate(doc._id);
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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

      {isUploadOpen && (
        <UploadDocumentModal
          onClose={() => setIsUploadOpen(false)}
          onUploaded={() => {
            queryClient.invalidateQueries({ queryKey });
          }}
        />
      )}
    </div>
  );
};

const UploadDocumentModal = ({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: () => uploadDocument(file as File, { title, tags }),
    onSuccess: (response) => {
      const doc = response.data;
      setDocumentId(doc._id);
      setStatus(doc.status.ingestionStatus);
      setErrorMessage(doc.status.errorMessage || null);
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.error?.message || 'Upload failed');
      setStatus('failed');
    }
  });

  useEffect(() => {
    if (!documentId) return;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const response = await getDocument(documentId);
        const doc = response.data;
        setStatus(doc.status.ingestionStatus);
        setErrorMessage(doc.status.errorMessage || null);
        if (doc.status.ingestionStatus === 'ready' || doc.status.ingestionStatus === 'failed') {
          queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] });
          onUploaded();
          return;
        }
      } catch (error) {
        setErrorMessage('Failed to fetch document status');
      }
      timer = window.setTimeout(poll, 2500);
    };

    poll();
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [documentId, queryClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file.');
      return;
    }
    setUploading(true);
    setErrorMessage(null);
    setStatus('processing');
    try {
      await uploadMutation.mutateAsync();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="policy, faq, support"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">File</label>
            <input
              type="file"
              accept=".txt,.md,.pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Allowed: .txt, .md, .pdf, .docx (max 10MB)</p>
          </div>

          {status !== 'idle' && (
            <div className="bg-gray-50 border rounded-lg p-3 text-sm">
              <p>Status: <span className="font-medium">{status}</span></p>
              {errorMessage && <p className="text-red-600 mt-1">{errorMessage}</p>}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Close
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeDocumentsPage;
