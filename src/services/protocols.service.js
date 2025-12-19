export const getProtocols = async (filters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.append(key, value);
    }
  });

  const response = await fetch(`/api/protocols?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Error al cargar protocolos');
  }

  return response.json();
};