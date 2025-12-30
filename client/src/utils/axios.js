
import axios from "axios";

const api = axios.create({
  baseURL: "https://tpms-backend-i05s.onrender.com/api",
  withCredentials: true,
});

// Add Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses more carefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Log for debugging
    if (status === 401) {
      console.warn("Unauthorized request to:", url);
    }

    // If a 401 happens on protected endpoints (not login/register),
    // clear local session and redirect to login.
    // We avoid redirecting on calls to /auth/login, /auth/register, /auth/forgot-password, etc.
    const unauthSafePaths = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password-direct"];
    const isSafe = unauthSafePaths.some((p) => url.includes(p));

    if (status === 401 && !isSafe) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        window.location.href = "/login";
      }, 50);
    }

    return Promise.reject(error);
  }
);

export default api;

