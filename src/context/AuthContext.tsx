/**
 * AuthContext.tsx
 *
 * GLOBAL AUTHENTICATION CONTEXT (JWT BASED)
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* ============================================================
 * TYPES
 * ============================================================ */

export interface User {
  uid: string;
  email?: string | null;
  name?: string | null;
  provider?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;          // ✅ NEW
  loading: boolean;

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
  const [token, setToken] = useState<string | null>(null); // ✅ NEW
  const [loading, setLoading] = useState(true);

  /** Load session from localStorage safely */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (
        storedUser &&
        storedUser !== "undefined" &&
        storedToken &&
        storedToken !== "undefined"
      ) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken); // ✅ NEW
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

    setUser(newUser);
    setToken(token); // ✅ NEW

    try {
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", token);
    } catch (err) {
      console.error("Failed to save session to localStorage:", err);
    }
  };

  /** Manual login (email/password) */
  const setSessionFromLogin = ({ user, token }: { user: User; token: string }) => {
    setUser(user);
    setToken(token); // ✅ NEW

    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } catch (err) {
      console.error("Failed to save session to localStorage:", err);
    }
  };

  /** Global logout */
  const logout = () => {
    setUser(null);
    setToken(null); // ✅ NEW
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,               // ✅ NEW
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

/* ============================================================
 * HOOK
 * ============================================================ */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
