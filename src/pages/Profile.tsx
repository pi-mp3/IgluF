/**
 * Profile.tsx
 * Vista de perfil con:
 * - Edición de datos básicos
 * - Mensajes de error/éxito en la propia página
 * - Modal de confirmación para eliminar cuenta
 * - Modal de confirmación para CERRAR SESIÓN
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUser, updateUser, deleteUser } from "./api";
import { User } from "../models/User";

interface ProfileForm {
  name: string;
  lastName: string;
  age: string;
  email: string;
}

export default function Profile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ⬅️ nuevo modal de logout

  const [form, setForm] = useState<ProfileForm>({
    name: "",
    lastName: "",
    age: "",
    email: "",
  });

  // Detectar usuario logueado
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

  // Obtener datos de perfil
  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const data: User | null = await getUser(userId);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userId) return;
    setError("");
    setSuccessMessage("");

    setError("");
    setSuccessMessage("");

    // Validación básica
    if (!form.name.trim() || !form.lastName.trim() || !form.age.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await updateUser(userId, {
        firstName: form.name,
        lastName: form.lastName,
        age: Number(form.age),
      });
      setIsEditing(false);
      setSuccessMessage("Perfil actualizado correctamente.");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError("Error guardando perfil: " + err.message);
    }
  };

  // Abre el modal de confirmación de eliminación
  const handleDelete = () => {
    if (!userId) return;
    setShowDeleteModal(true);
  };

  // Acción real de eliminar cuenta (desde el modal)
  const confirmDelete = async () => {
    if (!userId) return;

    try {
      await deleteUser(userId);
      await signOut(auth);
      navigate("/login");
    } catch (err: any) {
      setError("Error al eliminar cuenta: " + err.message);
    }
  };

  // Abre el modal de confirmación de logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Acción real de cerrar sesión (desde el modal)
  const confirmLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err);
      setError("Error al cerrar sesión: " + err.message);
    } finally {
      setShowLogoutModal(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-card profile-card">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page profile-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Mi Perfil</h1>
        <p className="auth-subtitle">
          Gestiona tu información personal de Iglú.
        </p>

        {error && <p className="profile-error">⚠️ {error}</p>}
        {successMessage && (
          <p className="profile-success">✔ {successMessage}</p>
        )}

        <form
          className={`auth-card profile-card ${
            isEditing ? "profile-card--editing" : ""
          }`}
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

            {isEditing ? (
              <span className="profile-status-pill profile-status-pill--editing">
                Editando
              </span>
            ) : (
              <span className="profile-status-pill">Solo lectura</span>
            )}
          </div>

          <div className="profile-grid">
            <label className="auth-label">
              Nombre
              <div
                className={`auth-input-wrapper ${
                  isEditing ? "profile-input-editable" : ""
                }`}
              >
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
              <div
                className={`auth-input-wrapper ${
                  isEditing ? "profile-input-editable" : ""
                }`}
              >
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
              <div
                className={`auth-input-wrapper ${
                  isEditing ? "profile-input-editable" : ""
                }`}
              >
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
                <input
                  className="auth-input"
                  type="email"
                  disabled
                  value={form.email}
                />
              </div>
            </label>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <button
                type="button"
                className="auth-submit profile-primary-btn"
                onClick={handleSave}
              >
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
                className="profile-delete-btn"
                onClick={handleDelete}
              >
                Eliminar cuenta
              </button>

              <button
                type="button"
                className="profile-logout-btn"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de confirmación de eliminación de cuenta */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Eliminar cuenta</h3>
            <p className="modal-text">
              Esta acción eliminará permanentemente tu cuenta y no podrá
              deshacerse. ¿Deseas continuar?
            </p>

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn-danger"
                onClick={confirmDelete}
              >
                Sí, eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de CERRAR SESIÓN */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Cerrar sesión</h3>
            <p className="modal-text">
              Se cerrará tu sesión actual en Iglú. Podrás volver a iniciar
              sesión cuando quieras usando tu correo y contraseña.
            </p>

            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>
              <button
                className="modal-btn modal-btn-danger"
                onClick={confirmLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
