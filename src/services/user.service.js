import api from "../api/axios";



export const resetUserPassword = async (identifier) => {
  const safeIdentifier = encodeURIComponent(identifier);
  const response = await api.put(`/users/${safeIdentifier}/password:reset`, {}); 
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await api.put(`/users/${userId}/status:block`, {});
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await api.put(`/users/${userId}/status:release`, {});
  return response.data;
};