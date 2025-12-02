import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

/**
 * Modal — Términos & condiciones
 */
function TermsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Términos y Condiciones</h2>

        <p>
          Este entorno es una plataforma de carácter académico y experimental,
          diseñada únicamente para fines formativos.
        </p>

        <p>
          Los datos ingresados se usan exclusivamente para pruebas, análisis
          interno y mejora del sistema.{" "}
          <strong>No serán vendidos ni usados con fines comerciales.</strong>
        </p>

        <p>
          La plataforma se ofrece “tal cual”, sin garantías de funcionamiento.
        </p>

        <p>Al registrarte, aceptas explícitamente estos términos.</p>

        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: "1.3rem",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * Register Page — Versión compacta y estilizada
 */
export default function Register(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // 👁️ estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Si ya inició sesión → no debe ver esta página
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    if (name === "confirmPassword") setConfirmPassword(value);
    else if (name === "acceptTerms") setAcceptTerms(checked);
    else setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== confirmPassword) {
      alert(t("register.passwordMismatch"));
      return;
    }

    if (!acceptTerms) {
      alert(t("register.mustAcceptTerms"));
      return;
    }

    try {
      const payload = { ...form, age: Number(form.age) };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error en el registro");
      }

      setMessage("Registro exitoso");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-page auth-page--compact">
      <div className="auth-wrapper auth-wrapper--compact">
        <h1 className="auth-title">{t("register.createAccount")}</h1>
        <p className="auth-subtitle">{t("register.fillForm")}</p>

        <form className="auth-card" onSubmit={handleSubmit}>
          {/* Nombre */}
          <label className="auth-label">
            {t("register.firstName")}
            <div className="auth-input-wrapper">
              <input
                type="text"
                name="firstName"
                className="auth-input"
                placeholder={t("register.placeholderFirstName")}
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Apellido */}
          <label className="auth-label">
            {t("register.lastName")}
            <div className="auth-input-wrapper">
              <input
                type="text"
                name="lastName"
                className="auth-input"
                placeholder={t("register.placeholderLastName")}
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Edad */}
          <label className="auth-label">
            {t("register.age")}
            <div className="auth-input-wrapper">
              <input
                type="number"
                name="age"
                className="auth-input"
                placeholder={t("register.placeholderAge")}
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Email */}
          <label className="auth-label">
            {t("register.email")}
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">@</span>
              <input
                type="email"
                name="email"
                className="auth-input"
                placeholder={t("register.placeholderEmail")}
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Password con ver/ocultar */}
          <label className="auth-label">
            {t("register.password")}
            <div
              className="auth-input-wrapper"
              style={{ position: "relative" }}
            >
              <span className="auth-input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="auth-input"
                placeholder={t("register.placeholderPassword")}
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Ver contraseña"
                }
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          {/* Confirmar password con ver/ocultar */}
          <label className="auth-label">
            {t("register.confirmPassword")}
            <div
              className="auth-input-wrapper"
              style={{ position: "relative" }}
            >
              <span className="auth-input-icon">🔒</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="auth-input"
                placeholder={t("register.placeholderConfirmPassword")}
                value={confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación de contraseña"
                    : "Ver confirmación de contraseña"
                }
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          {/* Aceptar términos */}
          <div className="auth-terms-wrapper">
            <label className="auth-terms">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={acceptTerms}
                onChange={handleChange}
              />
              <span>
                {t("register.acceptTerms")}{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setIsTermsOpen(true)}
                >
                  {t("register.termsAndConditions")}
                </button>
              </span>
            </label>
          </div>

          <button type="submit" className="auth-submit">
            {t("register.registerButton")}
          </button>

          {/* Ir a login */}
          <p className="auth-bottom-text">
            {t("register.alreadyHaveAccount")}{" "}
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/login")}
            >
              {t("register.login")}
            </button>
          </p>
        </form>

        {message && (
          <div
            className="simple-message"
            style={{
              marginTop: "1rem",
              padding: "0.6rem 1rem",
              borderRadius: "6px",
              background:
                message === "Registro exitoso" ? "#d4edda" : "#f8d7da",
              color: message === "Registro exitoso" ? "#155724" : "#721c24",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
