import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listRagTraces } from '../../api/support/ragDebug';
import { RagTrace } from '../../api/support/types';
import { useAuth } from '../../contexts/AuthContext';

const RagDebugPage = () => {
  const [conversationId, setConversationId] = useState('');
  const [messageId, setMessageId] = useState('');
  const [docName, setDocName] = useState('');
  const [docId, setDocId] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selected, setSelected] = useState<RagTrace | null>(null);
  const { hasPermission } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['rag-traces', { conversationId, messageId, docName, docId }],
    queryFn: () => listRagTraces({
      conversationId: conversationId || undefined,
      messageId: messageId || undefined,
      docName: docName || undefined,
      docId: docId || undefined,
      page: 1,
      limit: 20
    }),
    enabled: hasPermission('SUPPORT_RAG_DEBUG')
  });

  const traces = data?.data || [];

  const filteredTraces = useMemo(() => {
    if (!dateRange) return traces;
    const [start, end] = dateRange.split(' to ');
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    return traces.filter(trace => {
      const created = new Date(trace.createdAt);
      if (startDate && created < startDate) return false;
      if (endDate && created > endDate) return false;
      return true;
    });
  }, [traces, dateRange]);

  if (!hasPermission('SUPPORT_RAG_DEBUG')) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">RAG Debug Explorer</h1>
        <p className="text-gray-600 mt-2">You do not have permission to view RAG traces.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">RAG Debug Explorer</h1>
        <p className="text-gray-600 mt-1">Search and inspect retrieval traces across conversations.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 grid gap-4 md:grid-cols-5">
        <div>
          <label className="text-xs text-gray-500">Conversation ID</label>
          <input
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Message ID</label>
          <input
            value={messageId}
            onChange={(e) => setMessageId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Doc Name</label>
          <input
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Doc ID</label>
          <input
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Date Range (YYYY-MM-DD to YYYY-MM-DD)</label>
          <input
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Trace</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Conversation</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Latency</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">TopK</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Loading traces...</td>
                  </tr>
                ) : filteredTraces.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No traces found</td>
                  </tr>
                ) : (
                  filteredTraces.map(trace => (
                    <tr
                      key={trace.ragTraceId}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelected(trace)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">{trace.ragTraceId.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{trace.conversationId.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{trace.messageId.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{trace.models.chatModel}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{trace.latencyMs}ms</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{trace.params.topK}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(trace.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold">Trace Details</h2>
          {!selected ? (
            <p className="text-sm text-gray-500 mt-4">Select a trace to view details.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <p className="text-gray-500">Trace ID</p>
                  <p>{selected.ragTraceId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Model</p>
                  <p>{selected.models.chatModel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Latency</p>
                  <p>{selected.latencyMs} ms</p>
                </div>
                <div>
                  <p className="text-gray-500">Embed Model</p>
                  <p>{selected.models.embedModel}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Retrieved Chunks</h3>
                <div className="mt-2 space-y-3">
                  {selected.chunks.map(chunk => (
                    <div key={`${chunk.docId}-${chunk.chunkId}`} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{chunk.docName}</span>
                        <span>Score: {chunk.score?.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{chunk.textPreview}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Parameters</h3>
                <p className="text-xs text-gray-600 mt-2">
                  topK: {selected.params.topK}, chunkSize: {selected.params.chunkSize}, overlap: {selected.params.overlap}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RagDebugPage;

