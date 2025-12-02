/**
 * User.ts (Frontend model)
 *
 * This interface mirrors the User model used in the backend.
 * It ensures type safety across the application.
 */

export interface User {
  id?: string;
  name: string;
  lastName?: string;
  age?: number;
  email: string;
  password?: string;
  authProvider: 'manual' | 'google' | 'facebook';
  oauthId?: string;
  createdAt: string | Date; // Firestore sends timestamp as string
  uid: string;
}
