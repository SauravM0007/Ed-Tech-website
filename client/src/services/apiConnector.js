import axios from "axios";
import { toast } from "react-hot-toast";

const TOKEN_KEY = "token";

export const getStoredToken = () => {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("user");
};

export const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isHandlingUnauthorized = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const isRoleError = message.includes("Protected Route");

    if (status === 401 && !isRoleError && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      clearAuthSession();

      const userMessage =
        message.includes("expired") ||
        message.includes("invalid") ||
        message.includes("missing")
          ? "Session expired. Please login again."
          : message || "Session expired. Please login again.";

      toast.error(userMessage);

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const apiConnector = (
  method,
  url,
  bodyData = null,
  headers = {},
  params = {}
) => {
  return axiosInstance({
    method,
    url,
    data: bodyData ?? undefined,
    headers,
    params,
  });
};
