import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) return;
    if (password !== confirm) return;

    console.log("Nueva contraseña guardada:", password);

    setDone(true);

    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        <h1 className="auth-title">Crear nueva contraseña</h1>
        <p className="auth-subtitle">
          Ingresa una contraseña segura para tu cuenta.
        </p>

        <div className="auth-card">
          {!done ? (
            <form onSubmit={handleSubmit}>

              {/* Nueva contraseña */}
              <label className="auth-label">
                Nueva contraseña
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </label>

              {/* Confirmación */}
              <label className="auth-label">
                Confirmar contraseña
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
              </label>

              {/* Botón */}
              <button type="submit" className="auth-submit" style={{ marginTop: "1.5rem" }}>
                Guardar contraseña
              </button>

              <p className="auth-bottom-text">
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => navigate("/login")}
                >
                  ← Volver a iniciar sesión
                </button>
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-green-600 font-semibold text-lg">
                ✔ Contraseña actualizada
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
