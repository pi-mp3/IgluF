import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, User as FirebaseUser } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

// ====================== Types ======================

export interface User {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginFirebase: (user: FirebaseUser) => void;
  logout: () => Promise<void>;
}

// ==================== Create Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== Provider Component ====================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ==================== Session Persistence ====================
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
      setLoading(false);
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
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
