// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById, updateUser, deleteUser, logoutUser } from "./api";

/**
 * Profile page component.
 *
 * Allows the user to:
 * - View their profile information
 * - Edit name, last name, age, and password
 * - Delete their account
 * - Logout from the session
 *
 * The component automatically fetches user data from the backend
 * using the userId decoded from the JWT token stored in localStorage.
 *
 * @component
 * @example
 * return <Profile />
 */
export default function Profile() {
  const navigate = useNavigate();

  /** State to toggle edit mode */
  const [isEditing, setIsEditing] = useState(false);

  /** Logged-in user ID extracted from token */
  const [userId, setUserId] = useState<string | null>(null);

  /** Form data for profile editing */
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });

  /** Loading indicator */
  const [loading, setLoading] = useState(true);

  /** Error message */
  const [error, setError] = useState("");

  /**
   * On mount, extract userId from JWT stored in localStorage.
   * If no valid token exists, redirect to login.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserId(payload.id);
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  /**
   * Fetch user profile from backend.
   * Called whenever `userId` changes.
   */
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const data = await getUserById(userId);
        setForm({
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          email: data.email,
          password: "", // never fetch password
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  /**
   * Handles input changes in the form.
   * @param e - Input change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Saves the edited profile.
   * Calls backend API to update user.
   */
  const handleSave = async () => {
    if (!userId) return;
    try {
      await updateUser(userId, form);
      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      alert(err.message);
    }
  };

  /**
   * Deletes the current user account.
   * Calls backend API and clears session data.
   */
  const handleDelete = async () => {
    if (!userId) return;
    if (!window.confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;
    try {
      await deleteUser(userId);
      localStorage.removeItem("token");
      alert("Cuenta eliminada correctamente");
      navigate("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  /**
   * Logs out the current user.
   * Calls backend API and clears session data.
   */
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div>Error: {error}</div>;

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
                disabled
                value={form.email}
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

          {/* Botones */}
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
              className="auth-submit"
              style={{ background: "#f0ad4e" }}
              onClick={handleDelete}
            >
              Eliminar cuenta
            </button>

            <button
              type="button"
              className="auth-submit"
              style={{ background: "#d9534f" }}
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
