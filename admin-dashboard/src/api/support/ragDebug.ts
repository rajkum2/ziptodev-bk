import apiClient from '../apiClient';
import { ApiResponse, PaginatedResponse, RagTrace } from './types';

export const listRagTraces = (params: {
  conversationId?: string;
  messageId?: string;
  traceId?: string;
  ragTraceId?: string;
  docName?: string;
  docId?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params.conversationId) query.set('conversationId', params.conversationId);
  if (params.messageId) query.set('messageId', params.messageId);
  if (params.traceId) query.set('traceId', params.traceId);
  if (params.ragTraceId) query.set('ragTraceId', params.ragTraceId);
  if (params.docName) query.set('docName', params.docName);
  if (params.docId) query.set('docId', params.docId);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<RagTrace>>(`/admin/support/rag-traces?${query}`);
};

export const getRagTrace = (ragTraceId: string) => {
  return apiClient.get<ApiResponse<RagTrace>>(`/admin/support/rag-traces/${ragTraceId}`);
};

