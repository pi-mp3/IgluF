import axios from 'axios';

/**
 * Base URL for API requests.
 * Pulled from environment variable VITE_API_URL.
 */
const API_URL = import.meta.env.VITE_API_URL as string;

/**
 * Axios HTTP instance configured with base URL and JSON headers.
 * Use this instance for all API calls.
 */
export const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
