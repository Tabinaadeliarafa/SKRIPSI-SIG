import axios from "axios";

/**
 * Axios client untuk Laravel API.
 * Set VITE_API_BASE_URL di .env (mis: http://localhost:8000/api atau https://sig.example.com/api)
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: { Accept: "application/json" },
  withCredentials: false,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // log ringan; biarkan caller yang handle
    if (import.meta.env.DEV) console.warn("[API]", err?.config?.url, err?.message);
    return Promise.reject(err);
  }
);
