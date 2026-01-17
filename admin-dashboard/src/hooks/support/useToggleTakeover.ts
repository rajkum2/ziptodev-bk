import { useMutation } from '@tanstack/react-query';
import { returnToAi, takeoverConversation } from '../../api/support/conversations';

export const useToggleTakeover = () => {
  return useMutation({
    mutationFn: ({ conversationId, targetMode }: { conversationId: string; targetMode: 'HUMAN_ONLY' | 'AI_ONLY' | 'AI_ASSIST' }) => {
      if (targetMode === 'HUMAN_ONLY') {
        return takeoverConversation(conversationId);
      }
      return returnToAi(conversationId, targetMode);
    }
  });
};

