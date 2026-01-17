import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import * as Dialog from '@radix-ui/react-dialog';
import { MessageSquare, Search } from 'lucide-react';
import { useConversationsList } from '../../hooks/support/useConversationsList';
import { useAssignConversation } from '../../hooks/support/useAssignConversation';
import { useCloseConversation } from '../../hooks/support/useCloseConversation';
import { toggleNeedsReview } from '../../api/support/conversations';
import { ConversationListItem, PaginatedResponse } from '../../api/support/types';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const TAB_OPTIONS = ['All', 'Open', 'Needs Review', 'Human Handling', 'Closed'] as const;
const QUEUE_OPTIONS = ['delivery', 'refund', 'payment', 'product', 'general'];
const STATUS_OPTIONS = ['open', 'closed', 'all'];
const ASSIGNED_OPTIONS = ['me', 'unassigned', 'any'];

const ConversationsInboxPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const { socket } = useSocket();

  const [activeTab, setActiveTab] = useState<typeof TAB_OPTIONS[number]>('All');
  const [status, setStatus] = useState('all');
  const [queue, setQueue] = useState('all');
  const [assigned, setAssigned] = useState('any');
  const [needsReview, setNeedsReview] = useState<boolean | undefined>(undefined);
  const [slaBreached, setSlaBreached] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [assignTargetId, setAssignTargetId] = useState<string | null>(null);
  const [unreadSet, setUnreadSet] = useState<Record<string, boolean>>({});

  const canView = hasPermission('SUPPORT_VIEW');
  const canManage = hasPermission('SUPPORT_MANAGE');
  const canAssign = canManage && hasPermission('SUPPORT_ASSIGN');
  const canClose = canManage && hasPermission('SUPPORT_CLOSE');

  useEffect(() => {
    if (activeTab === 'Needs Review') {
      setNeedsReview(true);
      setStatus('open');
    } else if (activeTab === 'Open') {
      setStatus('open');
      setNeedsReview(undefined);
    } else if (activeTab === 'Closed') {
      setStatus('closed');
      setNeedsReview(undefined);
    } else if (activeTab === 'All') {
      setStatus('all');
      setNeedsReview(undefined);
    } else {
      setStatus('all');
      setNeedsReview(undefined);
    }
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [status, queue, assigned, needsReview, slaBreached, search]);

  const { data, isLoading } = useConversationsList({
    status,
    queue,
    needsReview,
    assigned,
    slaBreached,
    q: search || undefined,
    page,
    limit: 20
  });

  const assignMutation = useAssignConversation();
  const closeMutation = useCloseConversation();
  const reviewMutation = useMutation({
    mutationFn: ({ conversationId, needsReview }: { conversationId: string; needsReview: boolean }) =>
      toggleNeedsReview(conversationId, needsReview)
  });

  useEffect(() => {
    if (!socket) return;

    const handleConversationEvent = (payload: any) => {
      const conversationId = payload?.conversationId;
      const message = payload?.message;
      const conversation = payload?.conversation || payload;

      if (!conversationId) return;

      if (message?.role === 'customer') {
        setUnreadSet(prev => ({ ...prev, [conversationId]: true }));
      }

      queryClient.setQueriesData(
        { queryKey: ['support-conversations'] },
        (oldData: PaginatedResponse<ConversationListItem> | undefined) => {
          if (!oldData) return oldData;
          const updatedList = oldData.data.map(item => {
            if (item.conversationId !== conversationId) return item;
            return {
              ...item,
              ...conversation,
              lastMessagePreview: message?.content || item.lastMessagePreview,
              lastMessageAt: message?.createdAt || item.lastMessageAt,
              lastMessageRole: message?.role || item.lastMessageRole,
              unread: message?.role === 'customer' ? true : item.unread
            };
          });

          const exists = oldData.data.some(item => item.conversationId === conversationId);
          if (!exists && message) {
            updatedList.unshift({
              conversationId,
              status: conversation.status || 'open',
              mode: conversation.mode || 'AI_ONLY',
              queue: conversation.queue || 'general',
              priority: conversation.priority || 'medium',
              needsReview: conversation.needsReview || false,
              aiConfidence: conversation.aiConfidence || null,
              assignedToAdminId: conversation.assignedToAdminId || null,
              lastMessagePreview: message.content,
              lastMessageAt: message.createdAt,
              lastMessageRole: message.role,
              unread: message.role === 'customer'
            });
          }

          return {
            ...oldData,
            data: updatedList
          };
        }
      );
    };

    socket.on('conversation:new_message', handleConversationEvent);
    socket.on('conversation:updated', handleConversationEvent);
    socket.on('conversation:assigned', handleConversationEvent);
    socket.on('conversation:mode_changed', handleConversationEvent);
    socket.on('conversation:closed', handleConversationEvent);

    return () => {
      socket.off('conversation:new_message', handleConversationEvent);
      socket.off('conversation:updated', handleConversationEvent);
      socket.off('conversation:assigned', handleConversationEvent);
      socket.off('conversation:mode_changed', handleConversationEvent);
      socket.off('conversation:closed', handleConversationEvent);
    };
  }, [socket, queryClient]);

  const conversations = useMemo(() => {
    const list = data?.data || [];
    if (activeTab === 'Human Handling') {
      return list.filter(item => item.mode === 'HUMAN_ONLY');
    }
    return list;
  }, [data, activeTab]);

  const columns = useMemo<ColumnDef<ConversationListItem>[]>(() => [
    {
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.original.status === 'open'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-700'
          }`}>
            {row.original.status}
          </span>
          {unreadSet[row.original.conversationId] && (
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>
      )
    },
    {
      header: 'Queue',
      accessorKey: 'queue'
    },
    {
      header: 'AI',
      cell: ({ row }) => (
        row.original.aiConfidence ? (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.original.aiConfidence === 'high'
              ? 'bg-green-100 text-green-700'
              : row.original.aiConfidence === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
          }`}>
            {row.original.aiConfidence}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      )
    },
    {
      header: 'Priority',
      accessorKey: 'priority'
    },
    {
      header: 'Customer',
      cell: ({ row }) => {
        const customer = row.original.customer;
        const phone = customer?.phone ? customer.phone.replace(/\d(?=\d{4})/g, '*') : 'Guest';
        return (
          <div>
            <p className="font-medium text-gray-900">{customer?.name || 'Guest User'}</p>
            <p className="text-xs text-gray-500">{phone}</p>
          </div>
        );
      }
    },
    {
      header: 'Last message',
      cell: ({ row }) => (
        <div className="max-w-[260px]">
          <p className="text-sm text-gray-700 truncate">{row.original.lastMessagePreview || '-'}</p>
        </div>
      )
    },
    {
      header: 'Assigned To',
      cell: ({ row }) => (
        <div className="text-sm text-gray-700">
          {row.original.assignedTo?.username || 'Unassigned'}
        </div>
      )
    },
    {
      header: 'SLA',
      cell: ({ row }) => (
        <span className={`text-xs font-semibold ${
          row.original.slaBreached ? 'text-red-600' : 'text-gray-600'
        }`}>
          {row.original.slaBreached ? 'Breached' : 'OK'}
        </span>
      )
    },
    {
      header: 'Updated',
      cell: ({ row }) => (
        <span className="text-xs text-gray-600">
          {row.original.lastMessageAt
            ? formatDistanceToNow(new Date(row.original.lastMessageAt), { addSuffix: true })
            : '-'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {canAssign && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAssignTargetId(row.original.conversationId);
              }}
              className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Assign
            </button>
          )}
          {canManage && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                reviewMutation.mutate({
                  conversationId: row.original.conversationId,
                  needsReview: !row.original.needsReview
                }, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-conversations'] })
                });
              }}
              className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            >
              {row.original.needsReview ? 'Unmark' : 'Review'}
            </button>
          )}
          {canClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeMutation.mutate(row.original.conversationId, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['support-conversations'] })
                });
              }}
              className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
            >
              Close
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUnreadSet(prev => ({ ...prev, [row.original.conversationId]: false }));
              navigate(`/support/conversations/${row.original.conversationId}`);
            }}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Open
          </button>
        </div>
      )
    }
  ], [navigate, unreadSet, canAssign, canClose, canManage, reviewMutation, closeMutation, queryClient]);

  const table = useReactTable({
    data: conversations,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  if (!canView) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Conversations</h1>
        <p className="text-gray-600 mt-2">You do not have permission to view support conversations.</p>
      </div>
    );
  }

  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-gray-600 mt-1">Monitor live support chat activity.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MessageSquare className="w-4 h-4" />
          {pagination?.total || 0} total
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB_OPTIONS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              activeTab === tab ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 grid gap-4 md:grid-cols-5">
        <div>
          <label className="text-xs text-gray-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Queue</label>
          <select
            value={queue}
            onChange={(e) => setQueue(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          >
            <option value="all">all</option>
            {QUEUE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Assigned</label>
          <select
            value={assigned}
            onChange={(e) => setAssigned(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full"
          >
            {ASSIGNED_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={() => setSlaBreached(prev => !prev)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              slaBreached ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            SLA Breached
          </button>
          <button
            onClick={() => setNeedsReview(prev => prev ? undefined : true)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              needsReview ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Needs Review
          </button>
        </div>
        <div className="relative">
          <label className="text-xs text-gray-500">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Customer, phone, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 w-full"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">Loading conversations...</td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">No conversations found</td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setUnreadSet(prev => ({ ...prev, [row.original.conversationId]: false }));
                      navigate(`/support/conversations/${row.original.conversationId}`);
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, pagination.pages))}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Dialog.Root open={!!assignTargetId} onOpenChange={(open) => !open && setAssignTargetId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6">
            <Dialog.Title className="text-lg font-semibold">Assign Conversation</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mt-1">
              Assign this conversation to yourself.
            </Dialog.Description>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  if (!assignTargetId) return;
                  assignMutation.mutate({ conversationId: assignTargetId, assignedToAdminId: 'me' }, {
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ['support-conversations'] });
                      setAssignTargetId(null);
                    }
                  });
                }}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                Assign to me
              </button>
              <Dialog.Close className="flex-1 border border-gray-300 px-4 py-2 rounded-lg">Cancel</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
};

export default ConversationsInboxPage;

