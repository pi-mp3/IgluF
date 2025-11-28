/**
 * AuthContext.tsx
 *
 * Authentication context for the application.
 *
 * Features:
 *  - Manages user authentication state with Firebase Auth
 *  - Provides login and logout functions
 *  - Persists user session using localStorage
 *  - Provides loading state while checking auth status
 *  - Can be used globally in the app via React Context
 *
 * Usage:
 *  <AuthProvider>
 *      <App />
 *  </AuthProvider>
 * 
 * Hooks:
 *  - useAuth(): returns { user, loading, loginFirebase, logout }
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, User as FirebaseUser } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

// ====================== Types ======================

/**
 * User object stored in context and localStorage
 */
export interface User {
  uid: string;            // Firebase user UID
  email: string | null;    // User email
}

/**
 * Context value type
 */
interface AuthContextType {
  user: User | null;                 // Current authenticated user
  loading: boolean;                  // Loading state while checking session
  loginFirebase: (user: FirebaseUser) => void; // Login using Firebase User object
  logout: () => Promise<void>;       // Logout function
}

// ==================== Create Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Provider Component ====================

/**
 * AuthProvider
 *
 * Wrap your application with this provider to make
 * authentication state available globally.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ==================== Session Persistence ====================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const u: User = { uid: firebaseUser.uid, email: firebaseUser.email };
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // ==================== Login Function ====================

  /**
   * loginFirebase
   *
   * Call this function after successful Firebase Auth login
   * to update context state and localStorage.
   *
   * @param firebaseUser - Firebase User object from signIn
   */
  const loginFirebase = (firebaseUser: FirebaseUser) => {
    const u: User = { uid: firebaseUser.uid, email: firebaseUser.email };
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  // ==================== Logout Function ====================

  /**
   * logout
   *
   * Signs out the user from Firebase Auth,
   * clears localStorage, updates context state,
   * and redirects to /login.
   */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // ==================== Return Context ====================

  return (
    <AuthContext.Provider value={{ user, loading, loginFirebase, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==================== Custom Hook ====================

/**
 * useAuth
 *
 * Hook to access authentication context.
 * Throws an error if used outside AuthProvider.
 *
 * @returns {AuthContextType} - { user, loading, loginFirebase, logout }
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
