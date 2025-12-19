import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getProtocols } from '../services/protocols.service';

export const useProtocols = (filters) => {
  return useQuery({
    queryKey: ['protocols', filters],
    queryFn: () => getProtocols(filters),
    
    placeholderData: keepPreviousData,
    
    staleTime: 1000 * 60 * 5,
  });
};