import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // adjust to your backend

export const login = async (email, password) => {
  const { data } = await axios.post(`${API_URL}/login`, { email, password });
  sessionStorage.setItem("user", JSON.stringify(data)); // store token & role
  return data;
};

export const getProfile = async () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user?.token) return null;
  const { data } = await axios.get(`${API_URL}/profile`, {
    headers: { Authorization: `Bearer ${user.token}` },
  });
  return data;
};

export const logout = () => {
  sessionStorage.removeItem("user");
};
