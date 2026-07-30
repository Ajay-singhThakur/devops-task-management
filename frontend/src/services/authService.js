import authApi from "./authApi";

export const registerUser = async (userData) => {
  const response = await authApi.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await authApi.post("/auth/login", userData);

  localStorage.setItem("token", response.data.token);

  return response.data;
};

export const getProfile = async () => {
  const response = await authApi.get("/auth/profile");
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("token");
};