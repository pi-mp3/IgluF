/**
 * OAuthCallback.tsx
 *
 * Handles OAuth redirection from Google or GitHub.
 * Extracts JWT and user info from URL query parameters,
 * saves the session in AuthContext, persists in localStorage,
 * and redirects to the dashboard.
 *
 * User-facing messages: Spanish
 * Developer documentation: English
 *
 * Notes:
 * - Works for both Google and GitHub OAuth.
 * - Expects backend to redirect with:
 *      /oauth/callback?token=JWT&uid=USER_ID&email=EMAIL&name=NAME&provider=PROVIDER
 * - If token or uid is missing, user is redirected back to /login
 * - Compatible with development (localhost) and production (domain) deployments
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const { setSessionFromOAuth } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parse query parameters from URL
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const uid = params.get("uid");
    const email = params.get("email") || null;
    const name = params.get("name") || null;
    const provider = params.get("provider") || "oauth";

    // Validate required parameters
    if (!token || !uid) {
      console.error("OAuth failed: missing token or uid");
      alert("Error al iniciar sesión. Intenta de nuevo.");
      navigate("/login");
      return;
    }

    // Save session via AuthContext
    if (typeof setSessionFromOAuth === "function") {
      setSessionFromOAuth({ uid, token, provider, email, name });
    }

    // Persist session in localStorage
    try {
      localStorage.setItem(
        "user",
        JSON.stringify({ uid, provider, email, name })
      );
      localStorage.setItem("token", token);
    } catch (err) {
      console.error("Failed to save session to localStorage:", err);
    }

    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => navigate("/dashboard"), 500);

    setLoading(false);

    return () => clearTimeout(timer);
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
