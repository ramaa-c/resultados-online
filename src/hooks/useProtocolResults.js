import { useQuery } from "@tanstack/react-query";
import { getProtocolResults } from "../services/protocols.service";

export const useProtocolResults = (protocolId) => {
  return useQuery({
    queryKey: ["protocolResults", protocolId],
    queryFn: () => getProtocolResults(protocolId),
    enabled: !!protocolId, 
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};