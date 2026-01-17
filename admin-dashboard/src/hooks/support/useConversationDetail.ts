import { useQuery } from '@tanstack/react-query';
import { getConversationDetail } from '../../api/support/conversations';

export const useConversationDetail = (conversationId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['support-conversation', conversationId, params],
    queryFn: () => getConversationDetail(conversationId, params),
    enabled: !!conversationId
  });
};

