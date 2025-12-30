import api from '../api/axios';

export const loginUser = async (credentials) => {

  const response = await api.post('/auth/login', credentials);
  return response.data;
};