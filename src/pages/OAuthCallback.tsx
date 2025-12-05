// src/pages/OAuthCallback.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const { setSessionFromOAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const uid = params.get("uid");
    const accessToken = params.get("token");
    const provider = params.get("provider");

    // Datos opcionales
    const email = params.get("email");
    const name = params.get("name");

    // Validación mínima
    if (!uid || !accessToken) {
      navigate("/login");
      return;
    }

    // Guardar sesión globalmente
    setSessionFromOAuth({
      uid,
      accessToken,
      provider: provider || "oauth",
      email: email || null,
      name: name || null,
    });

    navigate("/dashboard");
  }, [navigate, setSessionFromOAuth]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      Procesando autenticación... (redirigiendo)
    </div>
  );
}
