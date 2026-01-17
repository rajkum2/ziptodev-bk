import { useQuery } from '@tanstack/react-query';
import { listConversations } from '../../api/support/conversations';

export const useConversationsList = (params: {
  status?: string;
  queue?: string;
  needsReview?: boolean;
  assigned?: string;
  slaBreached?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['support-conversations', params],
    queryFn: () => listConversations(params)
  });
};

