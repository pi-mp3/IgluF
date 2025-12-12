/**
 * OAuthCallback.tsx
 *
 * Handles OAuth redirection from Google or GitHub.
 * Extracts JWT and user info from URL query parameters,
 * saves the session in AuthContext, persists in localStorage,
 * and redirects to the dashboard.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const { setSessionFromOAuth } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const uid = params.get("uid");
    const email = params.get("email") || null;
    const name = params.get("name") || null;
    const provider = params.get("provider") || "oauth";
    const photoURL = params.get("photoURL") || null;

    // Validate required OAuth params
    if (!token || !uid) {
      console.error("OAuth failed: missing token or uid");
      alert("Error al iniciar sesión. Intenta de nuevo.");
      navigate("/login");
      return;
    }

    // --- FIX 1: Update global AuthContext properly ---
    try {
      if (typeof setSessionFromOAuth === "function") {
        setSessionFromOAuth({
          uid,
          token,
          provider,
          email,
          name,
        });
      }
    } catch (err) {
      console.error("❌ Error setting OAuth session in context:", err);
    }

    // --- FIX 2: Persist to localStorage ---
    try {
      localStorage.setItem(
        "user",
        JSON.stringify({ uid, provider, email, name, photoURL })
      );
      localStorage.setItem("token", token);
    } catch (err) {
      console.error("❌ Failed to save session to localStorage:", err);
    }

    // --- FIX 3: Redirect AFTER ensuring context writes ---
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);

    setLoading(false);
  }, [navigate, setSessionFromOAuth]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      {loading ? (
        <>
          <h2>Iniciando sesión...</h2>
          <p>Por favor espera.</p>
          <div
            style={{
              margin: "20px auto",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </>
      ) : (
        <p>Redirigiendo...</p>
      )}
    </div>
  );
}
