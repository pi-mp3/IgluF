import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { loginFirebase } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("uid");
    const token = params.get("token"); // si tu backend genera JWT

    if (!uid) {
      navigate("/login");
      return;
    }

    // Guarda en localStorage
    localStorage.setItem("uid", uid);
    if (token) localStorage.setItem("token", token);

    // Opcional: llamar backend para traer perfil completo
    fetch(`http://localhost:5000/api/user/${uid}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(userData => {
        loginFirebase(userData); // guardar en context
        navigate("/dashboard");
      })
      .catch(() => navigate("/dashboard"));
  }, [loginFirebase, navigate]);

  return <div>Procesando autenticación... (redirigiendo)</div>;
}
