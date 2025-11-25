// src/pages/ForgotPassword.tsx
/**
 * ForgotPassword.tsx
 *
 * Sends a password recovery email using Firebase Authentication.
 * Does NOT use backend routes. This component is entirely frontend-based.
 *
 * - Documentation: English
 * - UI: Spanish
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!email) {
      setMessage("El correo electrónico es obligatorio");
      setLoading(false);
      return;
    }

    try {
      // Firebase sends the password reset email
      await sendPasswordResetEmail(auth, email);
      setMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (error: any) {
      setMessage(error.message || "Error al enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Recuperar Contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            <label className="auth-label">
              Correo electrónico
              <div className="auth-input-wrapper">
                <input
                  className="auth-input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            {message && (
              <p className="text-center mt-3 text-sm text-red-600">{message}</p>
            )}

            <p className="auth-bottom-text mt-4">
              <button
                type="button"
                className="auth-link"
                onClick={() => navigate("/login")}
              >
                ← Volver al Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
