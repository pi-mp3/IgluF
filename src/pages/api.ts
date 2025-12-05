/**
 * api.ts
 *
 * FRONTEND API SERVICE
 * ---------------------------------------------------------
 * Developer documentation: English
 * User-facing messages: Spanish
 *
 * This file communicates ONLY with your backend.
 * Aligned 100% with your current backend controllers.
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
 * Backend: POST /auth/register
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
 * Login using email/password
 * Backend: POST /auth/login
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
 * Google OAuth login redirect
 * Backend: GET /auth/google
 */
export const loginGoogle = () => {
  window.location.href = `${http.defaults.baseURL}/auth/google`;
};

/**
 * GitHub OAuth login redirect
 * Backend: GET /auth/github
 */
export const loginGitHub = () => {
  window.location.href = `${http.defaults.baseURL}/auth/github`;
};

/**
 * Logout user
 * Backend: POST /auth/logout
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

/* ============================================================
 * PASSWORD RECOVERY
 * ============================================================ */

/**
 * Request password reset email
 * Backend: POST /recover/user/send-reset-email
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
 * Reset password
 * Backend: POST /recover/user/reset-password
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
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Error actualizando la contraseña"
    );
  }
};

/* ============================================================
 * USER CRUD
 * ============================================================ */

/**
 * Update a user by ID
 * Backend: PUT /user/:id
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
 * Delete a user by ID
 * Backend: DELETE /user/:id
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
 * Get a user by UID
 * Backend: GET /user/:id
 *
 * IMPORTANT:
 * Your backend returns a PLAIN user object:
 * {
 *   uid,
 *   email,
 *   displayName,
 *   provider,
 *   createdAt
 * }
 */
export const getUser = async (id: string): Promise<User | null> => {
  try {
    const res = await http.get(`/user/${id}`);

    if (!res.data) return null;

    return res.data as User; // <-- matches backend EXACTLY
  } catch (err) {
    return null; // to avoid frontend crashing
  }
};
