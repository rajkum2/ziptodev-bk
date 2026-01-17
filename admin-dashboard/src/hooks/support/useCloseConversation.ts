import { useMutation } from '@tanstack/react-query';
import { closeConversation } from '../../api/support/conversations';

export const useCloseConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) => closeConversation(conversationId)
  });
};

