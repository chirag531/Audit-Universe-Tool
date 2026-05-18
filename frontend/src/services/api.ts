import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const api = axios.create({ baseURL });

const raw = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (!original || original._retry) return Promise.reject(error);
    const path = original.url || "";
    if (path.includes("/auth/login") || path.includes("/auth/register")) {
      return Promise.reject(error);
    }
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return Promise.reject(error);
    original._retry = true;
    try {
      const { data } = await raw.post("/auth/refresh", null, {
        params: { refreshToken },
      });
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.role);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (e) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      return Promise.reject(e);
    }
  }
);

export default api;
