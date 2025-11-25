// src/pages/api.ts
import { http } from "../api/http";

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
 *
 * @param userData - Object containing user registration data
 * @returns Backend response
 */
export const registerUser = async (userData: RegisterData) => {
  try {
    const res = await http.post("/auth/register", userData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error registrando el usuario");
  }
};

/**
 * Logs in a user with email/password.
 * Backend route: POST /auth/login
 *
 * @param credentials - Object with email and password
 * @returns Backend response
 */
export const loginUser = async (credentials: LoginData) => {
  try {
    const res = await http.post("/auth/login", credentials);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error iniciando sesión");
  }
};

/**
 * Google OAuth login.
 * Backend route: POST /auth/login/google
 *
 * @param idToken - Google ID token
 * @returns Backend response
 */
export const loginGoogle = async (idToken: string) => {
  try {
    const res = await http.post("/auth/login/google", { idToken });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error iniciando sesión con Google");
  }
};

/**
 * Facebook OAuth login.
 * Backend route: POST /auth/login/facebook
 *
 * @param accessToken - Facebook access token
 * @returns Backend response
 */
export const loginFacebook = async (accessToken: string) => {
  try {
    const res = await http.post("/auth/login/facebook", { accessToken });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error iniciando sesión con Facebook");
  }
};

/**
 * Sends a password recovery email.
 * Backend route: POST /recover/user/send-reset-email
 *
 * @param email - Email address to send recovery instructions
 * @returns Backend response
 */
export const recoverPassword = async (email: string) => {
  try {
    const res = await http.post("/recover/user/send-reset-email", { email });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error enviando correo de recuperación");
  }
};

/**
 * Resets user password.
 * Backend route: POST /recover/user/reset-password
 *
 * @param email - User email
 * @param newPassword - New password
 * @param token - Recovery token from email
 * @returns Backend response
 */
export const resetPassword = async (email: string, newPassword: string, token: string) => {
  try {
    const res = await http.post("/recover/user/reset-password", { email, newPassword, token });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error actualizando la contraseña");
  }
};

/**
 * Logs out the current user.
 * Backend route: POST /auth/logout
 *
 * Frontend should also remove tokens/session after this call.
 * @returns Backend response
 */
export const logoutUser = async () => {
  try {
    const res = await http.post("/auth/logout");
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error cerrando sesión");
  }
};

/**
 * Updates user account by ID.
 * Backend route: PUT /user/:id
 *
 * @param id - User ID
 * @param data - Object with editable fields
 * @returns Backend response
 */
export const updateUser = async (id: string, data: EditUserData) => {
  try {
    const res = await http.put(`/user/${id}`, data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error actualizando usuario");
  }
};

/**
 * Deletes user account by ID.
 * Backend route: DELETE /user/:id
 *
 * @param id - User ID
 * @returns Backend response
 */
export const deleteUser = async (id: string) => {
  try {
    const res = await http.delete(`/user/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error eliminando usuario");
  }
};

/**
 * Gets user data by ID.
 * Backend route: GET /user/:id
 *
 * @param id - User ID
 * @returns User data
 */
export const getUserById = async (id: string) => {
  try {
    const res = await http.get(`/user/${id}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Error obteniendo datos del usuario");
  }
};
