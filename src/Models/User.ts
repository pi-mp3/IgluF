/**
 * User.ts (Frontend model)
 *
 * This interface mirrors the User model used in the backend.
 * It ensures type safety across the application.
 */

export interface User {
  uid: string;
  email?: string | null;
  name?: string | null;
  lastName?: string | null;
  age?: number | null;
  provider?: 'manual' | 'google' | 'github';
  photoURL?: string | null;
}

