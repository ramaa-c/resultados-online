import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markProtocolAsRead, markProtocolAsUnread } from "../services/protocols.service";

export const useProtocolMutations = () => {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: markProtocolAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["protocols"]);
    },
    onError: (error) => {
        console.error("Error al marcar como leído:", error);
    }
  });

  const markUnread = useMutation({
    mutationFn: markProtocolAsUnread,
    onSuccess: () => {
      queryClient.invalidateQueries(["protocols"]);
    },
    onError: (error) => {
        console.error("Error al marcar como no leído:", error);
    }
  });

  return { markRead, markUnread };
};