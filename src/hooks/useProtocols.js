import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProtocols } from '../services/protocols.service';

export const useProtocols = (filters, { isPollingEnabled = true } = {}) => {
  return useQuery({
    queryKey: ['protocols', filters],
    queryFn: ({ signal }) => getProtocols(filters, signal),
    
    placeholderData: keepPreviousData, 
    
    staleTime: 10000, 
    
    refetchInterval: isPollingEnabled ? 30000 : false,

    refetchOnWindowFocus: isPollingEnabled,

    refetchOnReconnect: isPollingEnabled,
    
    refetchOnMount: isPollingEnabled,

    refetchIntervalInBackground: false,
  });
};