/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Environment configuration for the Frontend.
 * All values come from Vite environment variables.
 */
export const ENV = {
  CHAT_SERVER_URL: import.meta.env.VITE_CHAT_SERVER_URL || "http://localhost:4000",
  USER_SERVER_URL: import.meta.env.VITE_USER_SERVER_URL || "http://localhost:5000",
};
