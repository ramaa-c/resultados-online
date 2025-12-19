import { useQuery } from "@tanstack/react-query";

export const useProtocolResults = (protocolId) => {
  return useQuery({
    queryKey: ["protocolResults", protocolId],
    queryFn: async () => {
      if (!protocolId) return null;
      // Usamos la URL que me pasaste antes
      const response = await fetch(`/api/protocols/${protocolId}/results`);
      if (!response.ok) throw new Error("Error al cargar los resultados detallados");
      return response.json();
    },
    enabled: !!protocolId, // Solo corre si hay un ID seleccionado
    retry: 1,
    staleTime: 5 * 60 * 1000, // Mantiene los datos frescos por 5 min
  });
};