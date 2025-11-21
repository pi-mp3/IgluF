import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recoverPassword } from "./api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await recoverPassword(email);
      setSent(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        <h1 className="auth-title">Recuperar contraseña</h1>
        <p className="auth-subtitle">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>

        <div className="auth-card">

          {!sent ? (
            <form onSubmit={handleSubmit}>
              <label className="auth-label">
                Correo electrónico
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">@</span>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </label>

              <button type="submit" className="auth-submit" style={{ marginTop: "1.8rem" }}>
                Enviar enlace
              </button>
            </form>
          ) : (
            <div className="text-center mt-4">
              <p className="text-green-600 font-medium">
                ✔ Enviamos un correo a <strong>{email}</strong>
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                Revisa tu bandeja de entrada.
              </p>
            </div>
          )}

          <p className="auth-bottom-text">
            <button
              type="button"
              className="auth-link"
              onClick={() => navigate("/login")}
            >
              ← Volver a iniciar sesión
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
