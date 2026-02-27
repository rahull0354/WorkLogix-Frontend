import axios, { AxiosError } from "axios";

const requestStartTimes = new WeakMap();

// base for api calls
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000, // 10 sec
  headers: {
    "Content-Type": "application/json",
  },
});

// request interceptor
api.interceptors.request.use(
  (config) => {
    // get token from localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // adding token to header if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Store start time for this request
    requestStartTimes.set(config, Date.now());
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// response interceptor
api.interceptors.response.use(
  (response) => {
    // calculate request duration
    const startTime = requestStartTimes.get(response.config);
    const duration = startTime ? Date.now() - startTime : 0;

    requestStartTimes.delete(response.config);
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
          break;
        case 403:
          // Forbidden
          break;
        case 404:
          // Not Found
          break;
        case 500:
          // Server Error
          break;
        default:
          // Let AuthContext handle all other errors with toast
          break;
      }
    } else if (error.request) {
      // Network error - let AuthContext handle
    } else {
      // Request setup error - let AuthContext handle
    }

    return Promise.reject(error);
  },
);

export default api;
