import apiClient from '../apiClient';
import {
  ApiResponse,
  PaginatedResponse,
  ConversationListItem,
  ConversationDetailResponse,
  ConversationMessage
} from './types';

export const listConversations = (params: {
  status?: string;
  queue?: string;
  needsReview?: boolean;
  assigned?: string;
  slaBreached?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.queue) query.set('queue', params.queue);
  if (params.needsReview !== undefined) query.set('needsReview', String(params.needsReview));
  if (params.assigned) query.set('assigned', params.assigned);
  if (params.slaBreached !== undefined) query.set('slaBreached', String(params.slaBreached));
  if (params.q) query.set('q', params.q);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<ConversationListItem>>(`/admin/support/conversations?${query}`);
};

export const getConversationDetail = (conversationId: string, params?: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiClient.get<ApiResponse<ConversationDetailResponse>>(`/admin/support/conversations/${conversationId}${suffix}`);
};

export const assignConversation = (conversationId: string, assignedToAdminId: string | 'me') => {
  return apiClient.post<ApiResponse<ConversationListItem>>(`/admin/support/conversations/${conversationId}/assign`, {
    assignedToAdminId
  });
};

export const toggleNeedsReview = (conversationId: string, needsReview: boolean) => {
  return apiClient.post<ApiResponse<ConversationListItem>>(`/admin/support/conversations/${conversationId}/review`, {
    needsReview
  });
};

export const takeoverConversation = (conversationId: string) => {
  return apiClient.post<ApiResponse<ConversationListItem>>(`/admin/support/conversations/${conversationId}/takeover`);
};

export const returnToAi = (conversationId: string, mode: 'AI_ONLY' | 'AI_ASSIST' = 'AI_ONLY') => {
  return apiClient.post<ApiResponse<ConversationListItem>>(`/admin/support/conversations/${conversationId}/return-to-ai`, {
    mode
  });
};

export const closeConversation = (conversationId: string) => {
  return apiClient.post<ApiResponse<ConversationListItem>>(`/admin/support/conversations/${conversationId}/close`);
};

export const sendHumanMessage = (
  conversationId: string,
  content: string,
  type: 'reply' | 'note' = 'reply'
) => {
  return apiClient.post<ApiResponse<{ message: ConversationMessage }>>(
    `/admin/support/conversations/${conversationId}/messages`,
    {
      content,
      type
    }
  );
};

