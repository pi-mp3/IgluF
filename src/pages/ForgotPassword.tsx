import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Aquí luego conectarás tu API / endpoint real
    console.log("Email enviado a:", email);

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6"
         style={{ background: "var(--bg-page)" }}>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

        {/* Título */}
        <h2 className="text-2xl font-semibold text-center text-[var(--teal)]">
          Recuperar contraseña
        </h2>

        <p className="text-center text-gray-600 mt-2 text-sm">
          Ingresa tu correo electrónico y te enviaremos un enlace para cambiar tu contraseña.
        </p>

        {/* Formulario */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-center"
              style={{ background: "var(--teal)", color: "#ffffff" }}
            >
              Enviar enlace
            </button>
          </form>
        ) : (
          <div className="mt-6 text-center text-green-600 font-medium">
            ✔ Se ha enviado un correo a <strong>{email}</strong>.
            <p className="text-gray-600 mt-1 text-sm">
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
          </div>
        )}

        {/* Enlace a login */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-[var(--teal)] hover:underline font-medium"
          >
            ← Volver a Iniciar Sesión
          </Link>
        </div>

      </div>
    </div>
  );
}
