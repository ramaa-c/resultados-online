import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useProtocolMutations = () => {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: async (protocolId) => {
      const response = await fetch(`/api/protocols/${protocolId}:markAsRead`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error("Error al marcar como leído");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["protocols"]);
    },
  });

  const markUnread = useMutation({
    mutationFn: async (protocolId) => {
      const response = await fetch(`/api/protocols/${protocolId}:markAsUnread`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error("Error al marcar como no leído");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["protocols"]);
    },
  });

  return { markRead, markUnread };
};