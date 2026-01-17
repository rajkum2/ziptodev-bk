export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type ConversationStatus = 'open' | 'closed';
export type ConversationMode = 'AI_ONLY' | 'AI_ASSIST' | 'HUMAN_ONLY';
export type ConversationQueue = 'delivery' | 'refund' | 'payment' | 'product' | 'general';
export type ConversationPriority = 'low' | 'medium' | 'high';

export interface ConversationCustomer {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface ConversationAdmin {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ConversationListItem {
  conversationId: string;
  status: ConversationStatus;
  mode: ConversationMode;
  queue: ConversationQueue;
  priority: ConversationPriority;
  needsReview: boolean;
  aiConfidence?: 'high' | 'medium' | 'low' | null;
  assignedToAdminId?: string | null;
  assignedTo?: ConversationAdmin | null;
  customer?: ConversationCustomer | null;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  lastMessageRole?: string | null;
  unread?: boolean;
  slaBreached?: boolean;
  slaFirstResponseDueAt?: string | null;
  updatedAt?: string;
}

export interface ConversationMessage {
  _id?: string;
  messageId: string;
  conversationId: string;
  role: 'customer' | 'assistant' | 'human' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    traceId?: string | null;
    model?: string | null;
    latencyMs?: number | null;
    ragEnabled?: boolean | null;
    ragTraceId?: string | null;
    error?: boolean | null;
  };
}

export interface RecentOrder {
  _id?: string;
  orderId: string;
  status: string;
  totalAmount?: number;
  createdAt: string;
  items?: any[];
}

export interface ConversationDetailResponse {
  conversation: {
    conversationId: string;
    status: ConversationStatus;
    mode: ConversationMode;
    queue: ConversationQueue;
    priority: ConversationPriority;
    needsReview: boolean;
    aiConfidence?: 'high' | 'medium' | 'low' | null;
    assignedToAdminId?: string | null;
    customerUserId?: ConversationCustomer | null;
    guestSessionId?: string | null;
    lastMessageAt?: string;
    slaFirstResponseDueAt?: string | null;
    slaBreached?: boolean;
    updatedAt?: string;
  };
  messages: ConversationMessage[];
  pagination: Pagination;
  unreadCount?: number;
  lastMessageAt?: string;
  recentOrders?: RecentOrder[];
}

export interface RagChunk {
  docId: string;
  docName: string;
  chunkId: string;
  score: number;
  textPreview: string;
}

export interface RagTrace {
  ragTraceId: string;
  traceId?: string | null;
  conversationId: string;
  messageId: string;
  kbDocIds: string[];
  kbDocNames: string[];
  chunks: RagChunk[];
  params: {
    topK: number;
    chunkSize: number;
    overlap: number;
  };
  models: {
    embedModel: string;
    chatModel: string;
  };
  latencyMs: number;
  createdAt: string;
}

