/// <reference types="vite/client" />

/**
 * TypeScript definitions for Vite environment variables.
 * All frontend environment variables must start with VITE_ to be exposed to the client.
 */
interface ImportMetaEnv {
  // Firebase
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;

  // Backend
  readonly VITE_BACKEND_URL: string;  // URL de tu backend Express

  // OAuth
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GITHUB_CLIENT_ID?: string;

  // Otros servicios
  readonly VITE_CHAT_SERVER_URL?: string;
  readonly VITE_USER_SERVER_URL?: string;
}

/**
 * Extend ImportMeta to include env.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Centralized access to environment variables.
 * Provides defaults for local development.
 */
export const ENV = {
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  CHAT_SERVER_URL: import.meta.env.VITE_CHAT_SERVER_URL || "http://localhost:4000",
  USER_SERVER_URL: import.meta.env.VITE_USER_SERVER_URL || "http://localhost:5000",
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  GITHUB_CLIENT_ID: import.meta.env.VITE_GITHUB_CLIENT_ID || "",
};
