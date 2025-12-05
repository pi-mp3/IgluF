// src/api/http.ts
import axios from 'axios';

/**
 * Axios instance configured for the backend API.
 *
 * Base URL: http://localhost:5000/api
 * Default headers: 'Content-Type': 'application/json'
 */


export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});


/**
 * AuthAPI object with authentication-related utilities.
 * Currently only implements logout.
 */
export const AuthAPI = {
  /**
   * Logs out the current user.
   *
   * Steps:
   * 1. Retrieves JWT access token from localStorage.
   * 2. Calls backend POST /auth/logout with Bearer token.
   * 3. Removes accessToken and refreshToken from localStorage.
   *
   * @returns {Promise<void>} Resolves when logout completes.
   */
  logout: async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      await http.post(
        '/auth/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err) {
      console.error('Logout error:', err);
    }
  },
};
