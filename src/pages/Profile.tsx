/**
 * ============================================================
 *  PROFILE COMPONENT
 * ============================================================
 *
 * Description:
 * Manages the authenticated user's profile with full CRUD operations
 * (excluding delete, handled elsewhere) and logout, using Firebase Auth
 * and backend API. Includes confirmation modal for logout, styled buttons,
 * error/success messages, and auto-cleanup of notifications.
 *
 * UI:
 *  - All user-facing text is in Spanish
 *
 * Backend Contract:
 * {
 *   name: string;
 *   lastName: string;
 *   age: number;
 *   email: string;
 * }
 *
 * Notes:
 * - Email comes from Firebase and is read-only
 * - Password is not editable
 * - Delete functionality is handled in another component/instance
 * ============================================================
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUser, updateUser } from "./api";
import { User } from "../Models/User";
import { useAuth } from "../context/AuthContext";

interface ProfileForm {
  name: string;
  lastName: string;
  age: string;
  email: string;
}

export default function Profile(): JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Global auth context
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    lastName: "",
    age: "",
    email: "",
  });

  /** Detect logged-in Firebase user */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }
      setUserId(firebaseUser.uid);
      setForm((prev) => ({ ...prev, email: firebaseUser.email || "" }));
    });
    return () => unsubscribe();
  }, [navigate]);

  /** Fetch user profile from backend */
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const data = (await getUser(userId)) as User | null;
        if (!data) {
          setError("No hay datos guardados. Completa tu perfil.");
          setIsEditing(true);
          setLoading(false);
          return;
        }
        setForm({
          name: data.name || "",
          lastName: data.lastName || "",
          age: data.age?.toString() || "",
          email: data.email || "",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error obteniendo datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  /** Handle input changes */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** Save profile changes */
  const handleSave = async () => {
    if (!userId) return;
    setError("");
    setSuccessMessage("");

    if (!form.name.trim() || !form.lastName.trim() || !form.age.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await updateUser(userId, {
        name: form.name,
        lastName: form.lastName,
        age: Number(form.age),
      });
      setIsEditing(false);
      setSuccessMessage("Perfil actualizado correctamente.");

      // Auto-clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError("Error guardando perfil: " + err.message);

      // Auto-clear error after 6 seconds
      setTimeout(() => setError(""), 6000);
    }
  };

  /** Logout modal handlers */
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = async () => {
    try {
      await signOut(auth);
      logout();
      navigate("/login");
    } catch (err: any) {
      setError("Error al cerrar sesión: " + err.message);
      setTimeout(() => setError(""), 6000);
    } finally {
      setShowLogoutModal(false);
    }
  };

  if (loading)
    return (
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-card profile-card">Cargando perfil...</div>
        </div>
      </div>
    );

  return (
    <div className="auth-page profile-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Mi Perfil</h1>
        <p className="auth-subtitle">Gestiona tu información personal de Iglú.</p>

        {error && <p className="profile-error">⚠️ {error}</p>}
        {successMessage && <p className="profile-success">✔ {successMessage}</p>}

        <form
          className={`auth-card profile-card ${isEditing ? "profile-card--editing" : ""}`}
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="profile-section-header">
            <div>
              <h2>Información personal</h2>
              {isEditing && (
                <p className="profile-helper-text">
                  Estás editando tu información. No olvides guardar los cambios.
                </p>
              )}
            </div>
            <span className={`profile-status-pill ${isEditing ? "profile-status-pill--editing" : ""}`}>
              {isEditing ? "Editando" : "Solo lectura"}
            </span>
          </div>

          <div className="profile-grid">
            <label className="auth-label">
              Nombre
              <div className={`auth-input-wrapper ${isEditing ? "profile-input-editable" : ""}`}>
                <span className="auth-input-icon">👤</span>
                <input
                  className="auth-input"
                  type="text"
                  name="name"
                  disabled={!isEditing}
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </label>

            <label className="auth-label">
              Apellido
              <div className={`auth-input-wrapper ${isEditing ? "profile-input-editable" : ""}`}>
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

            <label className="auth-label">
              Edad
              <div className={`auth-input-wrapper ${isEditing ? "profile-input-editable" : ""}`}>
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

            <label className="auth-label">
              Correo electrónico
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">@</span>
                <input className="auth-input" type="email" disabled value={form.email} />
              </div>
            </label>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <button type="button" className="auth-submit profile-primary-btn" onClick={handleSave}>
                Guardar cambios
              </button>
            ) : (
              <button
                type="button"
                className="auth-submit profile-primary-btn"
                onClick={() => {
                  setIsEditing(true);
                  setSuccessMessage("");
                  setError("");
                }}
              >
                Editar perfil
              </button>
            )}

            <div className="profile-secondary-actions">
              <button
                type="button"
                className="profile-logout-btn profile-primary-btn"
                style={{ backgroundColor: "#e53935", color: "#fff", borderRadius: 25 }}
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Cerrar sesión</h3>
            <p className="modal-text">
              Se cerrará tu sesión actual en Iglú. Podrás volver a iniciar sesión cuando quieras usando tu correo y contraseña.
            </p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancelar
              </button>
              <button className="modal-btn modal-btn-danger" onClick={confirmLogout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
