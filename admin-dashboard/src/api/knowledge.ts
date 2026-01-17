import apiClient from './apiClient';

export interface KnowledgeDocument {
  _id: string;
  title: string;
  originalFileName: string;
  fileType: 'txt' | 'md' | 'pdf' | 'docx';
  storage: {
    storageDriver: string;
    filePath: string;
    fileSize: number;
  };
  status: {
    ingestionStatus: 'uploaded' | 'processing' | 'ready' | 'failed';
    errorMessage?: string | null;
    enabledForChat: boolean;
    tags: string[];
  };
  stats: {
    pageCount?: number;
    chunkCount: number;
    embeddingModel?: string;
  };
  createdByAdminId?: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

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

export interface KnowledgeChunk {
  _id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  metadata?: {
    page?: number;
    heading?: string;
    startChar?: number;
    endChar?: number;
  };
  vectorId?: string;
  createdAt: string;
}

export interface KnowledgeSearchResult {
  text: string;
  score: number | null;
  documentId: string | null;
  title: string;
  chunkIndex: number;
  page?: number | null;
}

export const uploadDocument = (file: File, payload: { title?: string; tags?: string }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (payload.title) {
    formData.append('title', payload.title);
  }
  if (payload.tags) {
    formData.append('tags', payload.tags);
  }
  return apiClient.post<ApiResponse<KnowledgeDocument>>('/admin/knowledge/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const listDocuments = (params: {
  page?: number;
  limit?: number;
  status?: string;
  enabled?: string;
  search?: string;
}) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  if (params.enabled !== undefined) query.set('enabled', params.enabled);
  if (params.search) query.set('search', params.search);
  return apiClient.get<PaginatedResponse<KnowledgeDocument>>(`/admin/knowledge/documents?${query}`);
};

export const getDocument = (id: string) => {
  return apiClient.get<ApiResponse<KnowledgeDocument>>(`/admin/knowledge/documents/${id}`);
};

export const updateDocument = (id: string, payload: { title?: string; tags?: string[]; enabledForChat?: boolean }) => {
  return apiClient.patch<ApiResponse<KnowledgeDocument>>(`/admin/knowledge/documents/${id}`, payload);
};

export const deleteDocument = (id: string) => {
  return apiClient.delete<ApiResponse<null>>(`/admin/knowledge/documents/${id}`);
};

export const reindexDocument = (id: string) => {
  return apiClient.post<ApiResponse<KnowledgeDocument>>(`/admin/knowledge/documents/${id}/reindex`);
};

export const listChunks = (id: string, params: { page?: number; limit?: number }) => {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  return apiClient.get<PaginatedResponse<KnowledgeChunk>>(`/admin/knowledge/documents/${id}/chunks?${query}`);
};

export const searchKnowledge = (payload: { query: string; topK?: number; documentId?: string }) => {
  return apiClient.post<ApiResponse<KnowledgeSearchResult[]>>('/admin/knowledge/search', payload);
};
