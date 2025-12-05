// ==================== Login.tsx ====================
// Página de inicio de sesión con correo/contraseña y OAuth (Google / GitHub)
// Limpia, funcional y con rutas corregidas
// ===================================================
// src/pages/Login.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/api";

// ==================== Íconos ====================
const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 533.5 544.3" aria-hidden>
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.2H272v95h147.5c-6.4 34.4-25 63.5-53.3 83.2l86.1 67.1c50.3-46.4 80.2-114.8 80.2-195.1z" />
    <path fill="#34A853" d="M272 544.3c72.1 0 132.5-23.7 176.6-64.3l-86.1-67.1c-23.9 16.1-54.4 25.6-90.5 25.6-69.6 0-128.6-47-149.7-110.1l-88.2 68.3c41.4 92.1 135.7 147.6 238 147.6z" />
    <path fill="#FBBC05" d="M122.3 328.4c-10.2-30.4-10.2-63.4 0-93.7l-88.2-68.3C-14.3 227.4-14.3 316.9 34.1 396.7l88.2-68.3z" />
    <path fill="#EA4335" d="M272 214.1c37.7 0 71.7 13 98.4 38.5l73.8-73.8C404.3 116.6 344.1 90 272 90c-102.3 0-196.6 55.5-238 147.6l88.2 68.3c21.1-63.1 80.1-110.1 149.7-110.1z" />
  </svg>
);

const GitHubIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden>
    <path
      fill="#181717"
      fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38v-1.33C3.79 14.37 3.32 12.8 3.32 12.8c-.36-.92-.88-1.16-.88-1.16-.72-.49.06-.48.06-.48.8.06 1.22.82 1.22.82.71 1.21 1.87.86 2.33.66.07-.52.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.56 7.56 0 012 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const accountDeleted =
    (location.state as { deleted?: boolean } | null)?.deleted || false;

  // Si ya está logueado → redirigir
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Banner de error desaparece solo
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==================== Login manual usando loginUser() ====================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    try {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err: any) {
      setLoginError(err.message || "Error de inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  // ==================== OAuth (corregido) ====================
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND}/auth/google`;
  };

  const handleGitHubLogin = () => {
    window.location.href = `${BACKEND}/auth/github`;
  };

  return (
    <div className="auth-page auth-page--compact">
      <div className="auth-wrapper auth-wrapper--compact">
        <h1 className="auth-title">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>

        {accountDeleted && (
          <div className="login-success-banner">
            ✔ Tu cuenta fue eliminada correctamente.
          </div>
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
                {showPassword ? "👁️" : "🙈"}
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
              <GoogleIcon /> <span>Google</span>
            </button>

            <button
              type="button"
              className="auth-social auth-social-github"
              onClick={handleGitHubLogin}
            >
              <GitHubIcon /> <span>GitHub</span>
            </button>
          </div>

          <p className="auth-bottom-text">
            ¿Aún no tienes cuenta?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/register")}
            >
              Crear una cuenta
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

