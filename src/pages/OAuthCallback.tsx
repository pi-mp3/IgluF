// src/pages/OAuthCallback.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Página de callback para OAuth (Google/GitHub)
 * 
 * Función:
 *  - Detecta usuario logueado tras OAuth
 *  - Actualiza AuthContext
 *  - Redirige automáticamente a /dashboard
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const { loginFirebase } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Actualiza contexto y redirige al dashboard
        loginFirebase(firebaseUser);
        navigate("/dashboard");
      } else {
        // Si no hay usuario, vuelve a login
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [loginFirebase, navigate]);

  return <div style={{ textAlign: "center", marginTop: "2rem" }}>Cargando sesión...</div>;
}
