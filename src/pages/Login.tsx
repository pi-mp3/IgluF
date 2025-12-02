/**
 * Login.tsx
 *
 * Handles:
 *  - Email/password login with Firebase
 *  - Google and Facebook login
 *  - Redirect to dashboard
 * 
 * Documentation: English comments
 * User messages: Español
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import axios from "axios";
import { auth } from "../firebaseConfig";
import { useAuth } from "../context/AuthContext"; // Tu context para manejar usuario logueado

// ==================== Icons ====================
const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 533.5 544.3">
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.2H272v95h147.5c-6.4 34.4-25 63.5-53.3 83.2l86.1 67.1c50.3-46.4 80.2-114.8 80.2-195.1z"/>
    <path fill="#34A853" d="M272 544.3c72.1 0 132.5-23.7 176.6-64.3l-86.1-67.1c-23.9 16.1-54.4 25.6-90.5 25.6-69.6 0-128.6-47-149.7-110.1l-88.2 68.3c41.4 92.1 135.7 147.6 238 147.6z"/>
    <path fill="#FBBC05" d="M122.3 328.4c-10.2-30.4-10.2-63.4 0-93.7l-88.2-68.3C-14.3 227.4-14.3 316.9 34.1 396.7l88.2-68.3z"/>
    <path fill="#EA4335" d="M272 214.1c37.7 0 71.7 13 98.4 38.5l73.8-73.8C404.3 116.6 344.1 90 272 90 169.7 90 75.4 145.5 34.1 237.6l88.2 68.3c21.1-63.1 80.1-110.1 149.7-110.1z"/>
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 32 32">
    <path fill="#1877F2" d="M32 16.1C32 7.2 24.9 0 16 0S0 7.2 0 16.1c0 8 5.9 14.7 13.6 15.9v-11h-4v-5h4v-3.8c0-4 2.4-6.2 6-6.2 1.7 0 3.4.3 3.4.3v3.8h-1.9c-1.9 0-2.5 1.2-2.5 2.4V16h4.3l-.7 5h-3.6v11C26.1 30.8 32 24.1 32 16.1z"/>
    <path fill="#fff" d="M22.3 21l.7-5H19v-3.5c0-1.2.6-2.4 2.5-2.4h1.9V6.3s-1.7-.3-3.4-.3c-3.6 0-6 2.2-6 6.2V16h-4v5h4v11c.8.1 1.7.2 2.5.2s1.7-.1 2.5-.2V21h3.6z"/>
  </svg>
);

// ==================== Component ====================
export default function Login(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loginFirebase } = useAuth();

  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ==================== Email/Password ====================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      loginFirebase(userCredential.user);
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error de login:", error);
      alert("Error de inicio de sesión. Verifica tu correo y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== Google ====================
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // ==================== Facebook ====================
  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);

      loginFirebase(result.user);

      await axios.post(`http://localhost:5000/api/auth/facebook/callback`, {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      });

      navigate("/dashboard");
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        alert("Has cerrado la ventana de login antes de completar.");
      } else {
        console.error("Error login Facebook:", error);
        alert("Login con Facebook fallido.");
      }
    }
  };

  // ==================== Render ====================
  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {/* Email */}
          <label className="auth-label">
            Correo electrónico
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className="auth-input"
              required
            />
          </label>

          {/* Password */}
          <label className="auth-label">
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              className="auth-input"
              required
            />
          </label>

          <div className="auth-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Recordarme
            </label>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </button>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">o continuar con</span>
            <span className="auth-divider-line" />
          </div>

          <div className="auth-social-row">
            <button type="button" className="auth-social auth-social-google" onClick={handleGoogleLogin}>
              <GoogleIcon /> <span>Google</span>
            </button>
            <button type="button" className="auth-social auth-social-facebook" onClick={handleFacebookLogin}>
              <FacebookIcon /> <span>Facebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
