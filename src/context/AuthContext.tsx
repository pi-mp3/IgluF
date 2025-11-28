// src/context/AuthContext.tsx
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

import React, {ReactNode, createContext, useContext, useState, useEffect } from "react";
import { AuthAPI } from "../api/http";

// ========================= Types =========================

interface User {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ========================= Context ========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===================== Auth Provider ======================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Login usando backend
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

      // Guardar tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Guardar usuario
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      // Redirección sin useNavigate
      window.location.href = "/dashboard";

    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout usando backend
  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (_) {}

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);

    // Redirección FIJA y estable
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ======================== Hook ============================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
