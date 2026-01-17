import { useQuery } from '@tanstack/react-query';
import { getRagTrace, listRagTraces } from '../../api/support/ragDebug';

export const useRagTrace = (params: { ragTraceId?: string; messageId?: string }) => {
  return useQuery({
    queryKey: ['support-rag-trace', params],
    queryFn: async () => {
      if (params.ragTraceId) {
        const res = await getRagTrace(params.ragTraceId);
        return res.data;
      }
      if (params.messageId) {
        const res = await listRagTraces({ messageId: params.messageId, limit: 1 });
        return res.data[0] || null;
      }
      return null;
    },
    enabled: !!params.ragTraceId || !!params.messageId
  });
};

