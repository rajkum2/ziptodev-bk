import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, Bot, User, UserCheck, Shield, RefreshCcw, ClipboardCopy, MessageCircle } from 'lucide-react';
import { useConversationDetail } from '../../hooks/support/useConversationDetail';
import { useToggleTakeover } from '../../hooks/support/useToggleTakeover';
import { useRagTrace } from '../../hooks/support/useRagTrace';
import { sendHumanMessage } from '../../api/support/conversations';
import { ConversationMessage } from '../../api/support/types';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const ConversationDetailPage = () => {
  const { conversationId } = useParams();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const { socket } = useSocket();
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [composerText, setComposerText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [activeTrace, setActiveTrace] = useState<{ ragTraceId?: string; messageId?: string } | null>(null);
  const [summary, setSummary] = useState('Loading conversation summary...');
  const [suggestedReply, setSuggestedReply] = useState('Thanks for reaching out! I can help with that.');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isFetching } = useConversationDetail(conversationId || '', { page, limit: 20 });
  const toggleTakeover = useToggleTakeover();

  const sendMutation = useMutation({
    mutationFn: ({ content, type }: { content: string; type: 'reply' | 'note' }) =>
      sendHumanMessage(conversationId || '', content, type),
    onSuccess: (response) => {
      const sentMessage = response?.data?.message;
      if (sentMessage) {
        setMessages(prev => {
          if (prev.some(message => message.messageId === sentMessage.messageId)) {
            return prev;
          }
          return [...prev, sentMessage];
        });
      }
      queryClient.invalidateQueries({ queryKey: ['support-conversation', conversationId] });
      setComposerText('');
      setInternalNote('');
    }
  });

  const ragTraceQuery = useRagTrace(activeTrace || {});

  const handleToggleMode = (targetMode: 'HUMAN_ONLY' | 'AI_ONLY' | 'AI_ASSIST') => {
    if (!conversationId) return;
    toggleTakeover.mutate(
      { conversationId, targetMode },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['support-conversation', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['support-conversations'] });
        }
      }
    );
  };

  const detail = data?.data;
  const conversation = detail?.conversation;
  const pagination = detail?.pagination;
  const recentOrders = detail?.recentOrders || [];

  useEffect(() => {
    if (!detail) return;
    const incoming = detail.messages || [];
    const ordered = [...incoming].reverse();

    if (page === 1) {
      setMessages(ordered);
    } else {
      setMessages(prev => [...ordered, ...prev]);
    }
  }, [detail, page]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('support:join_conversation', { conversationId });
    return () => {
      socket.emit('support:leave_conversation', { conversationId });
    };
  }, [socket, conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (payload: any) => {
      const message = payload?.message ?? payload;
      const eventConversationId = payload?.conversationId ?? message?.conversationId;

      if (!message || eventConversationId !== conversationId) return;

      setMessages(prev => {
        if (prev.some(existing => existing.messageId === message.messageId)) {
          return prev;
        }
        return [...prev, message];
      });
    };

    socket.on('conversation:new_message', handleNewMessage);

    return () => {
      socket.off('conversation:new_message', handleNewMessage);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!pagination) return;
      if (container.scrollTop < 80 && pagination.page < pagination.pages && !isFetching && !isLoadingMore) {
        setIsLoadingMore(true);
        setPage(prev => prev + 1);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [pagination, isFetching, isLoadingMore]);

  useEffect(() => {
    if (!isFetching) {
      setIsLoadingMore(false);
    }
  }, [isFetching]);

  useEffect(() => {
    const lastCustomer = [...messages].reverse().find(msg => msg.role === 'customer');
    const lastAssistant = [...messages].reverse().find(msg => msg.role === 'assistant');
    const summaryText = lastCustomer
      ? `Customer asked: "${lastCustomer.content.slice(0, 120)}"`
      : 'Conversation summary will appear here.';
    setSummary(summaryText);
    if (lastAssistant) {
      setSuggestedReply(lastAssistant.content.slice(0, 140));
    }
  }, [messages]);

  const internalNotes = useMemo(
    () => messages.filter(msg => msg.role === 'system' && msg.content.startsWith('Internal note:')),
    [messages]
  );

  const suggestedActions = [
    'Ask for order ID',
    'Provide refund policy snippet',
    'Escalate to human queue'
  ];

  const mode = conversation?.mode || 'AI_ONLY';
  const canManage = hasPermission('SUPPORT_MANAGE');
  const canTakeover = hasPermission('SUPPORT_MANAGE') && hasPermission('SUPPORT_TAKEOVER');

  if (!hasPermission('SUPPORT_VIEW')) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Conversation Detail</h1>
        <p className="text-gray-600 mt-2">You do not have permission to view support conversations.</p>
      </div>
    );
  }

  if (!isLoading && !conversation) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Conversation Detail</h1>
        <p className="text-gray-600 mt-2">Conversation not found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Conversation {conversationId?.slice(0, 8)}</h1>
            <p className="text-sm text-gray-500">Mode: {mode}</p>
          </div>
        </div>

        <div ref={scrollRef} className="bg-white rounded-lg shadow h-[520px] overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading conversation...</p>
          ) : (
            <>
              {isLoadingMore && <p className="text-xs text-gray-400 text-center">Loading older messages...</p>}
              {messages.map(message => (
                <div key={message.messageId} className="flex gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    message.role === 'customer'
                      ? 'bg-blue-100 text-blue-700'
                      : message.role === 'assistant'
                        ? 'bg-purple-100 text-purple-700'
                        : message.role === 'human'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                  }`}>
                    {message.role === 'customer' && <User className="w-4 h-4" />}
                    {message.role === 'assistant' && <Bot className="w-4 h-4" />}
                    {message.role === 'human' && <UserCheck className="w-4 h-4" />}
                    {message.role === 'system' && <Shield className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-gray-500">{message.role}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (message.metadata?.ragTraceId || message.messageId) && (
                      <button
                        onClick={() => setActiveTrace({ ragTraceId: message.metadata?.ragTraceId || undefined, messageId: message.messageId })}
                        className="text-xs text-purple-600 mt-2 inline-flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" />
                        View RAG Trace
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          {mode === 'AI_ONLY' && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-700">AI is currently handling this conversation.</p>
              {canTakeover && (
                <button
                  onClick={() => handleToggleMode('HUMAN_ONLY')}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm"
                >
                  Takeover
                </button>
              )}
            </div>
          )}

          {mode !== 'AI_ONLY' && canManage && (
            <textarea
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="Type a response..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]"
            />
          )}

          <div className="flex flex-wrap gap-2">
            {mode === 'AI_ASSIST' && canManage && (
              <button
                onClick={() => setComposerText(suggestedReply)}
                className="px-3 py-2 rounded-lg bg-purple-100 text-purple-700 text-sm"
              >
                Insert Suggested Reply
              </button>
            )}
            {mode !== 'AI_ONLY' && canManage && (
              <button
                onClick={() => sendMutation.mutate({ content: composerText, type: 'reply' })}
                disabled={!composerText.trim() || sendMutation.isPending}
                className="px-3 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50"
              >
                Send
              </button>
            )}
            {mode !== 'AI_ONLY' && canTakeover && (
              <button
                onClick={() => handleToggleMode('AI_ONLY')}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
              >
                Return to AI
              </button>
            )}
            {mode !== 'AI_ASSIST' && canTakeover && (
              <button
                onClick={() => handleToggleMode('AI_ASSIST')}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
              >
                AI Assist
              </button>
            )}
            {mode === 'AI_ASSIST' && canTakeover && (
              <button
                onClick={() => handleToggleMode('HUMAN_ONLY')}
                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
              >
                Takeover
              </button>
            )}
          </div>

          {canManage && (
            <div className="border-t border-gray-200 pt-3">
            <label className="text-xs text-gray-500">Create Internal Note</label>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add a private note..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-2 min-h-[70px]"
            />
            <button
              onClick={() => sendMutation.mutate({ content: internalNote, type: 'note' })}
              disabled={!internalNote.trim() || sendMutation.isPending}
              className="mt-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm disabled:opacity-50"
            >
              Add Note
            </button>
          </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold">Customer Context</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p><span className="text-gray-500">Name:</span> {conversation?.customerUserId?.name || 'Guest User'}</p>
            <p><span className="text-gray-500">Phone:</span> {conversation?.customerUserId?.phone?.replace(/\d(?=\d{4})/g, '*') || 'N/A'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {conversation?.priority === 'high' && <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">VIP</span>}
              {conversation?.needsReview && <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Needs Review</span>}
              <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">Repeat Customer</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-800">Recent Orders</h3>
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-500 mt-2">No recent orders available.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs text-gray-600">
                {recentOrders.map(order => (
                  <li key={order.orderId} className="border border-gray-100 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span>#{order.orderId}</span>
                      <span>{order.status}</span>
                    </div>
                    <p className="text-gray-400 mt-1">{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-800">Notes</h3>
            {internalNotes.length === 0 ? (
              <p className="text-xs text-gray-500 mt-2">No internal notes yet.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs text-gray-600">
                {internalNotes.map(note => (
                  <li key={note.messageId} className="border border-gray-100 rounded-lg p-2">
                    {note.content.replace('Internal note:', '').trim()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Assist</h2>
            <button
              onClick={() => setSummary(`Updated summary at ${new Date().toLocaleTimeString()}`)}
              className="text-xs text-purple-600 inline-flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3" />
              Regenerate Summary
            </button>
          </div>
          <p className="text-sm text-gray-700">{summary}</p>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Suggested Reply</h3>
            <button
              onClick={() => setSuggestedReply('Here is an updated suggested reply for the customer.')}
              className="text-xs text-purple-600 inline-flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3" />
              Regenerate
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
            {suggestedReply}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(suggestedReply)}
            className="text-xs text-gray-600 inline-flex items-center gap-1"
          >
            <ClipboardCopy className="w-3 h-3" />
            Copy Suggested Reply
          </button>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mt-4">Suggested Next Actions</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              {suggestedActions.map(action => (
                <li key={action}>• {action}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Dialog.Root open={!!activeTrace} onOpenChange={(open) => !open && setActiveTrace(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[620px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-h-[80vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold">RAG Trace</Dialog.Title>
            {ragTraceQuery.isLoading ? (
              <p className="text-sm text-gray-500 mt-4">Loading trace...</p>
            ) : ragTraceQuery.data ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <p className="text-gray-500">Trace ID</p>
                    <p>{ragTraceQuery.data.traceId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Latency</p>
                    <p>{ragTraceQuery.data.latencyMs} ms</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Embed Model</p>
                    <p>{ragTraceQuery.data.models.embedModel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Chat Model</p>
                    <p>{ragTraceQuery.data.models.chatModel}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Retrieval Parameters</h4>
                  <p className="text-xs text-gray-600">topK: {ragTraceQuery.data.params.topK}, chunkSize: {ragTraceQuery.data.params.chunkSize}, overlap: {ragTraceQuery.data.params.overlap}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Retrieved Chunks</h4>
                  <div className="space-y-3 mt-2">
                    {ragTraceQuery.data.chunks.map(chunk => (
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
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-4">No trace data available.</p>
            )}
            <Dialog.Close className="mt-4 px-3 py-2 rounded-lg border border-gray-300 text-sm">
              Close
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ConversationDetailPage;

