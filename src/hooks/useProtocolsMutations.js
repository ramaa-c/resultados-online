import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markProtocolAsRead, markProtocolAsUnread } from "../services/protocols.service";

export const useProtocolMutations = () => {
  const queryClient = useQueryClient();

  const markRead = useMutation({
    mutationFn: (id) => markProtocolAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
    },
  });

  const markUnread = useMutation({
    mutationFn: (id) => markProtocolAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["protocols"] });
    },
  });

  return { markRead, markUnread };
};