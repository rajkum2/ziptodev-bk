import { useMutation } from '@tanstack/react-query';
import { assignConversation } from '../../api/support/conversations';

export const useAssignConversation = () => {
  return useMutation({
    mutationFn: ({ conversationId, assignedToAdminId }: { conversationId: string; assignedToAdminId: string | 'me' }) =>
      assignConversation(conversationId, assignedToAdminId)
  });
};

