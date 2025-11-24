import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * User profile page.
 * Allows viewing and editing user information.
 */
export default function Profile() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  // Example user data (replace with API)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",

  });

  /**
   * Handles form input changes.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Saves edited profile (pending API integration).
   */
  const handleSave = () => {
    console.log("Saving profile:", form);
    setIsEditing(false);
  };

  /**
   * Logs out user.
   */
  const handleLogout = () => {
    // TODO: Clear tokens and session
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Mi Perfil</h1>
        <p className="auth-subtitle">Gestiona tu información personal</p>

        <form className="auth-card" onSubmit={(e) => e.preventDefault()}>
          
          {/* Nombre */}
          <label className="auth-label">
            Nombre
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input
                className="auth-input"
                type="text"
                name="firstName"
                disabled={!isEditing}
                value={form.firstName}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* Apellido */}
          <label className="auth-label">
            Apellido
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">👤</span>
              <input
                className="auth-input"
                type="text"
                name="lastName"
                disabled={!isEditing}
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* Edad */}
          <label className="auth-label">
            Edad
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🎂</span>
              <input
                className="auth-input"
                type="number"
                name="age"
                disabled={!isEditing}
                value={form.age}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* Correo */}
          <label className="auth-label">
            Correo electrónico
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">@</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                disabled={!isEditing}
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* Contraseña */}
          <label className="auth-label">
            Contraseña
            <div className="auth-input-wrapper">
              <span className="auth-input-icon">🔒</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="••••••••"
                disabled={!isEditing}
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </label>

          {/* BOTONES */}
          <div className="flex flex-col gap-3 mt-4">

            {!isEditing ? (
              <button
                type="button"
                className="auth-submit"
                onClick={() => setIsEditing(true)}
              >
                Editar perfil
              </button>
            ) : (
              <button
                type="button"
                className="auth-submit"
                onClick={handleSave}
              >
                Guardar cambios
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="auth-submit"
              style={{ background: "#d9534f" }} // rojo
            >
              Cerrar sesión
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
