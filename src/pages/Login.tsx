/**
 * Login.tsx
 *
 * Handles:
 *  - Email/password login with Firebase
 *  - Google and GitHub login (reemplazado Facebook por GitHub)
 *  - Redirect to dashboard
 *
 * Documentation: English comments
 * User messages: Español
 *
 * NOTA IMPORTANTE:
 * - Se hicieron los cambios mínimos: se sustituyó el botón/handler de Facebook por GitHub.
 * - No se tocó ningún estilo ni lógica de email/password.
 * - Google sigue exactamente igual (usa la misma URL que tenías).
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signInWithEmailAndPassword, GoogleAuthProvider } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext";

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden>
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.2H272v95h147.5c-6.4 34.4-25 63.5-53.3 83.2l86.1 67.1c50.3-46.4 80.2-114.8 80.2-195.1z"/>
    <path fill="#34A853" d="M272 544.3c72.1 0 132.5-23.7 176.6-64.3l-86.1-67.1c-23.9 16.1-54.4 25.6-90.5 25.6-69.6 0-128.6-47-149.7-110.1l-88.2 68.3c41.4 92.1 135.7 147.6 238 147.6z"/>
    <path fill="#FBBC05" d="M122.3 328.4c-10.2-30.4-10.2-63.4 0-93.7l-88.2-68.3C-14.3 227.4-14.3 316.9 34.1 396.7l88.2-68.3z"/>
    <path fill="#EA4335" d="M272 214.1c37.7 0 71.7 13 98.4 38.5l73.8-73.8C404.3 116.6 344.1 90 272 90 169.7 90 75.4 145.5 34.1 237.6l88.2 68.3c21.1-63.1 80.1-110.1 149.7-110.1z"/>
  </svg>
);

/**
 * GitHubIcon
 * Reemplaza al icono de Facebook: mantiene tamaño y posición.
 * Ícono simple en negro (estético neutro).
 */
const GitHubIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
    <path fill="#181717" fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.49-2.7-1.08-2.7-1.08-.36-.92-.88-1.16-.88-1.16-.72-.49.06-.48.06-.48.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.56 7.56 0 012 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

// ==================== Componente ====================

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { loginFirebase, user } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const accountDeleted =
    (location.state as { deleted?: boolean } | null)?.deleted || false;

  // Redirección si ya hay usuario
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Desaparece mensaje de error en 7s
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // ==================== Email/Password (misma lógica que antes) ====================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      loginFirebase(userCredential.user);
      navigate("/dashboard");
    } catch (error: any) {
      let msg = "Error de inicio de sesión.";
      if (error.code === "auth/user-not-found") msg = "No existe una cuenta con este correo.";
      else if (error.code === "auth/wrong-password") msg = "Contraseña incorrecta.";
      else if (error.code === "auth/invalid-email") msg = "El correo no es válido.";
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ==================== Google ====================
  const handleGoogleLogin = () => {
    // Igual que tu primer código (dev)
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // ==================== GitHub (reemplaza Facebook) ====================
  // Mínimo cambio: redirige al backend que inicia OAuth con GitHub.
  // Usamos localhost para mantener consistencia con tu código actual.
  const handleGitHubLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div className="auth-page auth-page--compact">
      <div className="auth-wrapper auth-wrapper--compact">
        <h1 className="auth-title">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>

        {accountDeleted && (
          <div className="login-success-banner">✔ Tu cuenta fue eliminada correctamente.</div>
        )}

        {loginError && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.8rem 1rem",
              borderRadius: "8px",
              backgroundColor: "#fdecea",
              color: "#b71c1c",
              fontSize: "0.95rem",
              border: "1px solid #f5c2c0",
              textAlign: "center",
            }}
          >
            ⚠️ {loginError}
          </div>
        )}

        <form className="auth-card" onSubmit={handleSubmit}>
          {/* Email */}
          <label className="auth-label">
            Correo electrónico
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">@</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="auth-input"
                required
              />
            </div>
          </label>

          {/* Contraseña con ver/ocultar */}
          <label className="auth-label">
            Contraseña
            <div className="auth-input-wrapper" style={{ position: "relative" }}>
              <span className="auth-input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="********"
                className="auth-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.3rem",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <div className="auth-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>{t("login.rememberMe")}</span>
            </label>

            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/forgot-password")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón iniciar sesión */}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Iniciando..." : t("login.loginButton")}
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">
              {t("login.orContinueWith")}
            </span>
            <span className="auth-divider-line" />
          </div>

          {/* Social login */}
          <div className="auth-social-row">
            <button
              type="button"
              className="auth-social auth-social-google"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon /> <span>{t("login.google")}</span>
            </button>

            <button type="button" className="auth-social auth-social-facebook" onClick={handleGitHubLogin}>
              <GitHubIcon /> <span>GitHub</span>
            </button>
          </div>

          <p className="auth-bottom-text">
            ¿Aún no tienes cuenta?{" "}
            <button type="button" className="auth-link" onClick={() => navigate("/register")}>
              Crear una cuenta
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
