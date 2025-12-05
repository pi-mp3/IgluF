/**
 * api.ts
 *
 * FRONTEND API SERVICE
 * ---------------------------------------------------------
 * This file communicates ONLY with your backend.
 * All routes match the backend controllers exactly.
 *
 * Developer documentation: English
 * User-facing messages: Spanish
 */

import { http } from "../api/http";
import { User } from "../models/User";

/* ============================================================
 * INTERFACES
 * ============================================================ */

/** Registration payload */
export interface RegisterData {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
}

/** Login payload */
export interface LoginData {
  email: string;
  password: string;
}

/** User edit payload */
export interface EditUserData {
  firstName?: string;
  lastName?: string;
  age?: number;
  password?: string;
}

/* ============================================================
 * AUTH SERVICES
 * ============================================================ */

/**
 * Register a new user
 * Backend: POST /api/auth/register
 */
export const registerUser = async (userData: RegisterData) => {
  try {
    const res = await http.post("/auth/register", userData);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error registrando el usuario"
    );
  }
};

/**
 * Login using email/password
 * Backend: POST /api/auth/login
 */
export const loginUser = async (credentials: LoginData) => {
  try {
    const res = await http.post("/auth/login", credentials);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error iniciando sesión"
    );
  }
};

/**
 * Google OAuth login redirect
 * Backend: GET /auth/google
 */
export const loginGoogle = () => {
  const BACKEND =
    (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:5000";

  window.location.href = `${BACKEND}/auth/google`;
};

/**
 * GitHub OAuth login redirect
 * Backend: GET /auth/github
 */
export const loginGitHub = () => {
  const BACKEND =
    (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:5000";

  window.location.href = `${BACKEND}/auth/github`;
};

/**
 * Logout user
 * Backend: POST /api/auth/logout
 */
export const logoutUser = async () => {
  try {
    const res = await http.post("/auth/logout");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error cerrando sesión"
    );
  }
};

/* ============================================================
 * PASSWORD RECOVERY
 * ============================================================ */

/**
 * Request password reset email
 * Backend: POST /api/recover/user/send-reset-email
 */
export const recoverPassword = async (email: string) => {
  try {
    const res = await http.post("/recover/user/send-reset-email", { email });
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error enviando correo de recuperación"
    );
  }
};

/**
 * Reset password
 * Backend: POST /api/recover/user/reset-password
 */
export const resetPassword = async (
  email: string,
  newPassword: string,
  token: string
) => {
  try {
    const res = await http.post("/recover/user/reset-password", {
      email,
      newPassword,
      token,
    });

    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error actualizando la contraseña"
    );
  }
};

/* ============================================================
 * USER CRUD
 * ============================================================ */

/**
 * Update a user by ID
 * Backend: PUT /api/user/:id
 */
export const updateUser = async (id: string, data: EditUserData) => {
  try {
    const res = await http.put(`/user/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error actualizando usuario"
    );
  }
};

/**
 * Delete a user by ID
 * Backend: DELETE /api/user/:id
 */
export const deleteUser = async (id: string) => {
  try {
    const res = await http.delete(`/user/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.message || "Error eliminando usuario"
    );
  }
};

/**
 * Get a user by UID
 * Backend: GET /api/user/:id
 */
export const getUser = async (id: string): Promise<User | null> => {
  try {
    const res = await http.get(`/user/${id}`);
    return res.data as User;
  } catch {
    return null;
  }
};
