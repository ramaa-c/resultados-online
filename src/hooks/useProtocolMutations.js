import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markProtocolAsRead,
  markProtocolAsUnread,
} from "../services/protocols.service";

export const useProtocolMutations = () => {
  const queryClient = useQueryClient();

  const performOptimisticUpdate = async (protocolId, newStatus) => {
    await queryClient.cancelQueries({ queryKey: ["protocols"] });

    const previousProtocolsData = queryClient.getQueriesData({
      queryKey: ["protocols"],
    });

    queryClient.setQueriesData({ queryKey: ["protocols"] }, (oldData) => {
      if (!oldData || !oldData.protocolos) return oldData;

      return {
        ...oldData,
        protocolos: oldData.protocolos.map((p) =>
          p.protocoloid === protocolId ? { ...p, leido: newStatus } : p
        ),
      };
    });

    return { previousProtocolsData };
  };

  // --- MARCAR LEÍDO ---
  const markRead = useMutation({
    mutationFn: markProtocolAsRead,

    onMutate: async (protocolId) => {
      return await performOptimisticUpdate(protocolId, "1");
    },

    onError: (err, protocolId, context) => {
      console.error("Error optimista (Read):", err);
      if (context?.previousProtocolsData) {
        context.previousProtocolsData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
    },
  });

  // --- MARCAR NO LEÍDO ---
  const markUnread = useMutation({
    mutationFn: markProtocolAsUnread,

    onMutate: async (protocolId) => {
      return await performOptimisticUpdate(protocolId, "0");
    },

    onError: (err, protocolId, context) => {
      console.error("Error optimista (Unread):", err);
      if (context?.previousProtocolsData) {
        context.previousProtocolsData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
    },
  });

  return { markRead, markUnread };
};
