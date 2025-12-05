/**
 * OAuthCallback.tsx
 *
 * Handles OAuth redirection from Google or GitHub.
 * Extracts JWT and user info from URL query params,
 * saves session in AuthContext, and redirects to dashboard.
 *
 * User-facing messages: Spanish
 */

import { useEffect, useState } from "react";
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

    // Validate required parameters
    if (!token || !uid) {
      console.error("OAuth failed: missing token or uid");
      alert("Error al iniciar sesión. Intenta de nuevo.");
      navigate("/login");
      return;
    }

    // Save session via AuthContext (no loop posible)
    setSessionFromOAuth({ uid, token, provider, email, name });

    // Optional: persist in localStorage
    try {
      localStorage.setItem("user", JSON.stringify({ uid, provider, email, name }));
      localStorage.setItem("token", token);
    } catch (err) {
      console.error("Failed to save session to localStorage:", err);
    }

    // Redirect to dashboard after short delay
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
