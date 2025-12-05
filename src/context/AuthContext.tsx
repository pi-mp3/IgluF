// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ==================== Tipos ====================
interface User {
  uid: string;
  email?: string | null;
  name?: string | null;
  provider?: string;
}

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens;
  loading: boolean;
  setSessionFromOAuth: (data: {
    uid: string;
    accessToken: string;
    refreshToken?: string;
    provider?: string;
    email?: string | null;
    name?: string | null;
  }) => void;
  loginFirebase: (userData: User, accessToken?: string, refreshToken?: string) => void;
  logout: () => void;
}

// ==================== Contexto ====================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Provider ====================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens>({
    accessToken: null,
    refreshToken: null,
  });
  const [loading, setLoading] = useState(true);

  // ==================== Cargar sesión de localStorage ====================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");

    if (storedUser && storedAccess) {
      setUser(JSON.parse(storedUser));
      setTokens({
        accessToken: storedAccess,
        refreshToken: storedRefresh,
      });
    }

    setLoading(false);
  }, []);

  // ==================== Guardar sesión desde OAuth ====================
  const setSessionFromOAuth = ({
    uid,
    accessToken,
    refreshToken,
    provider = "oauth",
    email = null,
    name = null,
  }: {
    uid: string;
    accessToken: string;
    refreshToken?: string;
    provider?: string;
    email?: string | null;
    name?: string | null;
  }) => {
    const newUser: User = { uid, provider, email, name };
    const newTokens: AuthTokens = { accessToken, refreshToken: refreshToken || null };

    setUser(newUser);
    setTokens(newTokens);

    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  // ==================== Guardar sesión desde Firebase ====================
  const loginFirebase = (userData: User, accessToken?: string, refreshToken?: string) => {
    setUser(userData);
    setTokens({ accessToken: accessToken || null, refreshToken: refreshToken || null });

    localStorage.setItem("user", JSON.stringify(userData));
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  // ==================== Logout global ====================
  const logout = () => {
    setUser(null);
    setTokens({ accessToken: null, refreshToken: null });

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        loading,
        setSessionFromOAuth,
        loginFirebase,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==================== Hook ====================
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
