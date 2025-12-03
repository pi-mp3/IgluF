/**
 * src/pages/api.ts
 *
 * API SERVICE — FRONTEND
 * Documentation: English comments
 * User messages: Español
 *
 * Cambios mínimos:
 * - Se reemplazó la función de Facebook por GitHub.
 * - Mantener el resto exactamente igual.
 */

import { http } from "../api/http";
import { User } from "../models/User";

/**
 * ============================================================
 *  API SERVICE FUNCTIONS
 * ============================================================
 */

/**
 * Interface for user registration data
 */
export interface RegisterData {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
}

/**
 * Interface for user login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface for editing user data
 */
export interface EditUserData {
  firstName?: string;
  lastName?: string;
  age?: number;
  password?: string;
}

/**
 * Registers a new user.
 * Backend route: POST /auth/register
 */
export const registerUser = async (userData: RegisterData) => {
  try {
    const res = await http.post("/auth/register", userData);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error registrando el usuario"
    );
  }
};

/**
 * Logs in a user with email/password.
 * Backend route: POST /auth/login
 */
export const loginUser = async (credentials: LoginData) => {
  try {
    const res = await http.post("/auth/login", credentials);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error iniciando sesión"
    );
  }
};

/**
 * Redirects user to Google OAuth login.
 * Backend route: GET /auth/google
 * NOTE: frontend must handle redirect flow
 */
export const loginGoogle = () => {
  window.location.href = `${http.defaults.baseURL}/auth/google`;
};

/**
 * Redirects user to GitHub OAuth login.
 * Backend route: GET /auth/github
 * NOTE: frontend must handle redirect flow
 *
 * Reemplaza la antigua función de Facebook por GitHub (cambio mínimo).
 */
export const loginGitHub = () => {
  window.location.href = `${http.defaults.baseURL}/auth/github`;
};

/**
 * Sends password recovery email.
 * Backend route: POST /recover/user/send-reset-email
 */
export const recoverPassword = async (email: string) => {
  try {
    const res = await http.post("/recover/user/send-reset-email", { email });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error enviando correo de recuperación"
    );
  }
};

/**
 * Resets user password.
 * Backend route: POST /recover/user/reset-password
 */
export const resetPassword = async (email: string, newPassword: string, token: string) => {
  try {
    const res = await http.post("/recover/user/reset-password", { email, newPassword, token });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error actualizando la contraseña"
    );
  }
};

/**
 * Logs out user.
 * Backend route: POST /auth/logout
 */
export const logoutUser = async () => {
  try {
    const res = await http.post("/auth/logout");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error cerrando sesión"
    );
  }
};

/**
 * Updates user by ID.
 * Backend route: PUT /user/:id
 */
export const updateUser = async (id: string, data: EditUserData) => {
  try {
    const res = await http.put(`/user/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error actualizando usuario"
    );
  }
};

/**
 * Deletes user by ID.
 * Backend route: DELETE /user/:id
 */
export const deleteUser = async (id: string) => {
  try {
    const res = await http.delete(`/user/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error eliminando usuario"
    );
  }
};

/**
 * Gets user by ID (UID).
 * Backend route: GET /user/:id
 *
 * ❗ IMPORTANT:
 * This ONLY calls the backend.
 * It does NOT include any logic or controllers.
 */
export const getUser = async (id: string) => {
  try {
    const res = await http.get(`/user/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error obteniendo usuario"
    );
  }
};
