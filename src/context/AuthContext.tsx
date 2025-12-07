import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

/* ============================================================
 * TYPES
 * ============================================================ */

export interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginFirebase: (user: FirebaseUser) => void;
  logout: () => Promise<void>;
  setSessionFromOAuth: (data: {
    uid: string;
    token: string;
    provider?: string;
    email?: string | null;
    name?: string | null;
  }) => void;
  setSessionFromLogin: (data: { user: User; token: string }) => void;
  logout: () => void;
}

/* ============================================================
 * CONTEXT
 * ============================================================ */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ============================================================
 * PROVIDER
 * ============================================================ */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load session from localStorage safely */
  useEffect(() => {
    // Leer user desde localStorage al iniciar
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u: User = { uid: firebaseUser.uid, email: firebaseUser.email };
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (err) {
      console.error("Failed to load user from localStorage:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  /** Hydrate session from OAuth login */
  const setSessionFromOAuth = ({
    uid,
    token,
    provider = "oauth",
    email = null,
    name = null,
  }: {
    uid: string;
    token: string;
    provider?: string;
    email?: string | null;
    name?: string | null;
  }) => {
    const newUser: User = { uid, provider, email, name };

    setUser(prev => {
      if (
        prev?.uid === newUser.uid &&
        prev?.email === newUser.email &&
        prev?.name === newUser.name &&
        prev?.provider === newUser.provider
      ) {
        return prev; // evitar re-render innecesario
      }
      return newUser;
    });

    return () => unsubscribe();
  }, []);

  // ==================== Login Function ====================
  const loginFirebase = (firebaseUser: FirebaseUser) => {
    const u: User = { uid: firebaseUser.uid, email: firebaseUser.email };
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  // ==================== Logout Function ====================
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ==================== Return Context ====================
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setSessionFromOAuth,
        setSessionFromLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==================== Custom Hook ====================
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
