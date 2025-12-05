/**
 * http.ts
 *
 * FRONTEND HTTP CLIENT (axios)
 * ---------------------------------------------------------
 * This file configures a single axios instance used throughout
 * the frontend to interact with your backend API.
 *
 * - Ensures a single baseURL coming from VITE_BACKEND_URL (fallback to localhost).
 * - Sets withCredentials to true so cookies (if used) are sent.
 * - Adds a simple response interceptor to normalize error messages.
 *
 * NOTE: Do not change UI copy. This file is purely internal.
 */

import axios from "axios";

const BACKEND = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:5000";

export const http = axios.create({
  baseURL: BACKEND + "/api", // prefix all requests with /api to match your backend mounting (app.use('/api', router))
  timeout: 15000,
  withCredentials: true, // IMPORTANT: allow cookies to be sent for session-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach token from localStorage to Authorization header for JWT flows
http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Normalize errors
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // Build a helpful error shape
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Network error";
    return Promise.reject(new Error(message));
  }
);

export default http;
