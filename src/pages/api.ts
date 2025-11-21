import { http } from '../api/http';

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
 * Registers a new user
 * @param userData - Object containing firstName, lastName, age, email, password
 * @returns Response data from backend
 */
export const registerUser = async (userData: RegisterData) => {
  try {
    const res = await http.post('/auth/register', userData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Error registering user');
  }
};

/**
 * Logs in a user manually
 * @param credentials - Object containing email and password
 * @returns Response data from backend
 */
export const loginUser = async (credentials: LoginData) => {
  try {
    const res = await http.post('/auth/login', credentials);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Error logging in');
  }
};

/**
 * Logs in a user with Google OAuth
 * @param idToken - Google ID token obtained from frontend
 * @returns Response data from backend
 */
export const loginGoogle = async (idToken: string) => {
  try {
    const res = await http.post('/auth/login/google', { idToken }); // fixed route
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Error logging in with Google');
  }
};

/**
 * Logs in a user with Facebook OAuth
 * @param accessToken - Facebook access token obtained from frontend
 * @returns Response data from backend
 */
export const loginFacebook = async (accessToken: string) => {
  try {
    const res = await http.post('/auth/login/facebook', { accessToken }); // fixed route
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Error logging in with Facebook');
  }
};

/**
 * Sends password recovery email
 * @param email - User's email to send recovery link
 * @returns Response data from backend
 */
export const recoverPassword = async (email: string) => {
  try {
    const res = await http.post('/user/recover-password', { email });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Error sending recovery email');
  }
};

/**
 * Resets the user's password using a recovery token
 * @param token - Token received in the password recovery email
 * @param newPassword - New password to set
 * @returns Response data from backend
 */
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const res = await http.post('/user/reset-password', {
      token,
      password: newPassword,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Error updating password');
  }
};
