import api from "../api/axios";

export const getProtocols = async (filters, signal) => {
  const params = new URLSearchParams();
  let processedFilters = { ...filters };

  const partesNombre = [];
  if (processedFilters.apellido_paciente)
    partesNombre.push(processedFilters.apellido_paciente.trim());
  if (processedFilters.patient_name)
    partesNombre.push(processedFilters.patient_name.trim());

  if (partesNombre.length > 0) {
    processedFilters.patient_name = partesNombre.join(" ");
  }
  delete processedFilters.apellido_paciente;

  Object.entries(processedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      let valorFinal = value;

      if (key === "unread_only" || key === "complete_only") {
        params.append(key, String(value));
        return;
      }

      if (
        (key === "date_from" || key === "date_to") &&
        typeof value === "string"
      ) {
        valorFinal = value.replaceAll("-", "");
      }
      params.append(key, valorFinal);
    }
  });
  const response = await api.get("/protocols", { params, signal });
  return response.data;
};

export const getProtocolResults = async (protocolId) => {
  const response = await api.get(`/protocols/${protocolId}/results`);
  return response.data;
};

export const markProtocolAsRead = async (protocolId) => {
  if (!protocolId) throw new Error("ID de protocolo inválido");
  const response = await api.put(`/protocols/${protocolId}:markAsRead`);
  return response.data;
};

export const markProtocolAsUnread = async (protocolId) => {
  if (!protocolId) throw new Error("ID de protocolo inválido");
  const response = await api.put(`/protocols/${protocolId}:markAsUnread`);
  return response.data;
};

export const getProtocolPdf = async (protocolId) => {
  const response = await api.get(`/protocols/${protocolId}:getPdf`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });
  return response.data;
};

export const sendProtocolEmail = async (protocolId, targetEmail) => {
  if (!protocolId) throw new Error("ID de protocolo inválido");

  const response = await api.post(`/protocols/${protocolId}:sendEmail`, {
    email: targetEmail,
    user: "WebPortal",
  });

  return response.data;
};
