// src/pages/Register.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Modal — Términos & condiciones
 * (misma idea que el original, solo un poco más compacto)
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
          background: "#ffffff",
          padding: "2rem",
          maxWidth: "480px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          maxHeight: "80vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Términos y Condiciones</h2>

        <p>
          Este entorno es una plataforma de carácter académico y experimental,
          diseñada solo para fines formativos y de prueba.
        </p>
        <p>
          Los datos que ingreses se usan exclusivamente para propósitos
          educativos, pruebas técnicas y análisis interno del sistema.{" "}
          <strong>No serán vendidos ni usados con fines comerciales.</strong>
        </p>
        <p>
          La plataforma se ofrece “tal cual” (as is); puede contener errores o
          interrupciones. No somos responsables por decisiones que tomes a
          partir de la información obtenida aquí.
        </p>
        <p>
          Al registrarte y usar esta plataforma, aceptas explícitamente estos
          términos. Si no estás de acuerdo, por favor no continúes con el
          registro.
        </p>

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
 * Register
 * Lógica antigua (la que ya funciona en el despliegue) + diseño compacto nuevo.
 */
export default function Register(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ======= estado (igual que en tu versión que funciona) =======
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);

  // ======= handlers (misma lógica que el código “viejo”) =======
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, checked } = e.target;

    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else if (name === "acceptTerms") {
      setAcceptTerms(checked);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // mismas validaciones que tenías
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

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el registro");
      }

      setMessage("Registro exitoso");

      // igual que antes
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: any) {
      console.error("Register error:", error);
      setMessage(error.message);
    }
  };

  // ======= UI: diseño compacto como el login nuevo =======
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

          {/* Password */}
          <label className="auth-label">
            {t("register.password")}
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type="password"
                name="password"
                className="auth-input"
                placeholder={t("register.placeholderPassword")}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          {/* Confirmar password */}
          <label className="auth-label">
            {t("register.confirmPassword")}
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                type="password"
                name="confirmPassword"
                className="auth-input"
                placeholder={t("register.placeholderConfirmPassword")}
                value={confirmPassword}
                onChange={handleChange}
                required
              />
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

          {/* Botón registrar */}
          <button
            type="submit"
            className="auth-submit"
            style={{ marginTop: "1.3rem" }}
          >
            {t("register.registerButton")}
          </button>

          {/* Ir a login */}
          <p className="auth-bottom-text" style={{ marginTop: "1.2rem" }}>
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

        {/* Mensaje de éxito / error (misma lógica que antes) */}
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
