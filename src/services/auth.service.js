import api from "../api/axios";

export const loginUser = async (credentials) => {
  const response = await api.post(
    "/auth/login",
    {},
    {
      headers: {
        jwtusername: credentials.jwtusername,
        jwtpassword: credentials.jwtpassword,
      },
    },
  );
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};
