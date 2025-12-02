/**
 * ============================================================
 *  PROFILE COMPONENT
 * ============================================================
 *
 * Description:
 * This component manages the authenticated user's profile.
 * It reads the Firebase Auth UID, fetches profile data from
 * the backend, allows editing fields, and supports logout
 * and account deletion.
 *
 * UI:
 *  - All UI text is in Spanish (user-facing requirement)
 *
 * Comments & Documentation:
 *  - 100% written in English as requested
 *
 * Backend Contract:
 * The backend must provide:
 * {
 *   name: string;
 *   lastName: string;
 *   age: number;
 *   email: string;
 * }
 *
 * Notes:
 * - Email comes from Firebase and is read-only.
 * - Password is not editable in this component.
 * ============================================================
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

  // Firebase UID
  const [userId, setUserId] = useState<string | null>(null);

  // Control UI states
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // Editable form state
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    lastName: "",
    age: "",
    email: "",
  });

  // ------------------------------------------------------------
  // Detect logged-in user (Firebase Authentication)
  // ------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      setUserId(firebaseUser.uid);

      setForm((prev) => ({
        ...prev,
        email: firebaseUser.email || "",
      }));
    });

    return () => unsubscribe();
  }, [navigate]);

  // ------------------------------------------------------------
  // Fetch profile from backend using UID
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Handle controlled inputs
  // ------------------------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------------------------------------------------
  // Save profile changes to backend
  // ------------------------------------------------------------
  const handleSave = async () => {
    if (!userId) return;

    // Basic validation
    if (!form.name.trim() || !form.lastName.trim() || !form.age.trim()) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await updateUser(userId, {
        firstName: form.name,
        lastName: form.lastName,
        age: Number(form.age),
      });

      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert("Error guardando perfil: " + err.message);
    }
  };

  // ------------------------------------------------------------
  // Delete account permanently
  // ------------------------------------------------------------
  const handleDelete = async () => {
    if (!userId) return;
    if (!window.confirm("¿Seguro que deseas eliminar tu cuenta?")) return;

    try {
      await deleteUser(userId);
      await signOut(auth);
      navigate("/login");
    } catch (err: any) {
      alert("Error al eliminar cuenta: " + err.message);
    }
  };

  // ------------------------------------------------------------
  // Log out user from Firebase
  // ------------------------------------------------------------
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // ------------------------------------------------------------
  // Loading screen
  // ------------------------------------------------------------
  if (loading) return <div>Cargando perfil...</div>;

  // ------------------------------------------------------------
  // Render profile UI
  // ------------------------------------------------------------
  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Mi Perfil</h1>

        {error && (
          <p style={{ color: "red", fontWeight: "bold" }}>⚠️ {error}</p>
        )}

        <form className="auth-card" onSubmit={(e) => e.preventDefault()}>
          <label className="auth-label">
            Nombre
            <input
              className="auth-input"
              type="text"
              name="name"
              disabled={!isEditing}
              value={form.name}
              onChange={handleChange}
            />
          </label>

          <label className="auth-label">
            Apellido
            <input
              className="auth-input"
              type="text"
              name="lastName"
              disabled={!isEditing}
              value={form.lastName}
              onChange={handleChange}
            />
          </label>

          <label className="auth-label">
            Edad
            <input
              className="auth-input"
              type="number"
              name="age"
              disabled={!isEditing}
              value={form.age}
              onChange={handleChange}
            />
          </label>

          <label className="auth-label">
            Correo electrónico
            <input
              className="auth-input"
              type="email"
              disabled
              value={form.email}
            />
          </label>

          {isEditing ? (
            <button className="auth-submit" onClick={handleSave}>
              Guardar cambios
            </button>
          ) : (
            <button className="auth-submit" onClick={() => setIsEditing(true)}>
              Editar perfil
            </button>
          )}

          <button
            className="auth-submit"
            style={{ background: "#f0ad4e" }}
            onClick={handleDelete}
          >
            Eliminar cuenta
          </button>

          <button
            className="auth-submit"
            style={{ background: "#d9534f" }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
