import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  const response = await api.post("/auth/login", data);

  localStorage.setItem("access_token", response.data.access_token);

  return response.data;
};

export const registerUser = async (data: RegisterData) => {
  const response = await api.post("/auth/register", data);

  return response.data;
};

export const getToken = () => {
  return localStorage.getItem("access_token");
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
};