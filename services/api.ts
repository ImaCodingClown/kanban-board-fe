import axios from "axios";
import { useAuth } from "@/store/authStore";
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retryCount?: number;
    _retry?: boolean;
  }
}

export const api = axios.create({
  baseURL: "https://kanban-board-be.onrender.com", // your Rust backend

  //baseURL: "http://localhost:8080", // for local development
  timeout: 5000,
});

const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

const calculateRetryDelay = (attempt: number): number => {
  return (
    RETRY_CONFIG.retryDelay *
    Math.pow(RETRY_CONFIG.retryMultiplier, attempt - 1)
  );
};

const isRetryableError = (error: any): boolean => {
  if (error.response) {
    return RETRY_CONFIG.retryableStatuses.includes(error.response.status);
  }
  if (error.code === "ECONNABORTED" || error.code === "NETWORK_ERROR") {
    return true;
  }
  return false;
};

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuth.getState().getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (!config._retryCount) {
      config._retryCount = 0;
    }
    return config;
  },
  (error) => {
    console.log("error inside api");
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.config?.url);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuth.getState().getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/refresh`, {
            refresh_token: refreshToken,
          });

          if (response.data.access_token) {
            const { access_token, refresh_token } = response.data;
            useAuth.getState().setTokens(access_token, refresh_token);

            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          useAuth.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        useAuth.getState().logout();
      }
    }
    if (
      isRetryableError(error) &&
      originalRequest._retryCount < RETRY_CONFIG.maxRetries
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      const delay = calculateRetryDelay(originalRequest._retryCount);

      console.log(
        `Retrying request (${originalRequest._retryCount}/${RETRY_CONFIG.maxRetries}) after ${delay}ms`,
      );

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(api(originalRequest));
        }, delay);
      });
    }
    if (error.response?.data?.error) {
      const errorData = error.response.data.error;
      error.userMessage = errorData.message || "An error occurred";
      error.errorCode = errorData.code;
      error.retryAfter = errorData.retry_after;
      error.timestamp = errorData.timestamp;
    }

    return Promise.reject(error);
  },
);

export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    await axios.get(`${api.defaults.baseURL}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

export const formatErrorMessage = (error: any): string => {
  if (error.userMessage) {
    return error.userMessage;
  }

  if (error.response?.status === 404) {
    return "Resource not found";
  }

  if (error.response?.status === 500) {
    return "Server error occurred. Please try again later";
  }

  if (error.code === "ECONNABORTED") {
    return "Request timeout. Please check your network connection";
  }

  if (error.code === "NETWORK_ERROR") {
    return "Please check your network connection";
  }

  return "An unknown error occurred";
};

export const canRetry = (error: any): boolean => {
  return isRetryableError(error);
};

export const getRetryAfter = (error: any): number | null => {
  return error.retryAfter || null;
};
