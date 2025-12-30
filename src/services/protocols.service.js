const getTodayISO = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const getProtocols = async (filters) => {
  const params = new URLSearchParams();
  const token = localStorage.getItem('token'); // Recuperamos el token
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

  const hasStrongFilters =
    (processedFilters.patient_id_number &&
      processedFilters.patient_id_number.trim() !== "") ||
    (processedFilters.accession_number &&
      processedFilters.accession_number.trim() !== "") ||
    (processedFilters.patient_name &&
      processedFilters.patient_name.trim() !== "") ||
    processedFilters.unread_only === true;

  if (!processedFilters.date_from && !processedFilters.date_to) {
    if (hasStrongFilters) {
      processedFilters.date_from = "20000101";
      processedFilters.date_to = getTodayISO();
    } else {
      const today = getTodayISO();
      processedFilters.date_from = today;
      processedFilters.date_to = today;
    }
  } else if (processedFilters.date_from && !processedFilters.date_to) {
    processedFilters.date_to = processedFilters.date_from;
  } else if (!processedFilters.date_from && processedFilters.date_to) {
    processedFilters.date_from = processedFilters.date_to;
  }

  Object.entries(processedFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      let valorFinal = value;
      if (key === "unread_only" || key === "complete_only") {
        if (value === true) params.append(key, "true");
        return;
      }
      if (key === "branch_id") {
        params.append("services", valorFinal);
        return;
      }
      if ((key === "date_from" || key === "date_to") && typeof value === "string") {
        valorFinal = value.replaceAll("-", "");
      }
      params.append(key, valorFinal);
    }
  });

  try {
    // Agregamos el header de Authorization
    const response = await fetch(`/api/protocols?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getProtocolResults = async (protocolId) => {
  const token = localStorage.getItem('token');
  try {
    const url = `/api/protocols/${protocolId}/results`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`, // Autorización requerida
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const markProtocolAsRead = async (protocolId) => {
  if (!protocolId) throw new Error("ID de protocolo inválido");
  const token = localStorage.getItem('token');
  const url = `/api/protocols/${protocolId}:markAsRead`;

  const response = await fetch(url, { 
    method: "PUT",
    headers: {
      'Authorization': `Bearer ${token}` // Autorización requerida
    }
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error API (${response.status}): ${err}`);
  }
  return true;
};

export const markProtocolAsUnread = async (protocolId) => {
  if (!protocolId) throw new Error("ID de protocolo inválido");
  const token = localStorage.getItem('token');
  const url = `/api/protocols/${protocolId}:markAsUnread`;

  const response = await fetch(url, { 
    method: "PUT",
    headers: {
      'Authorization': `Bearer ${token}` // Autorización requerida
    }
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Error API (${response.status}): ${err}`);
  }
  return true;
};