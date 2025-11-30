import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUserById, updateUser, deleteUser } from "./api";
import { userInfo } from "os";

/**
 * Perfil del usuario
 *
 * Permite ver y editar la información del usuario autenticado.
 */
export default function Profile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });

  // ==============================
  // 🔹 Detectar usuario logueado
  // ==============================
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

  // ==============================
  // 🔹 Obtener datos del backend
  // ==============================
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const data = await getUserById(userId);

        if (!data) {
          setError("No hay datos guardados. Completa tu perfil.");
          setIsEditing(true);
          setLoading(false);
          return;
        }

       setForm({
          firstName: userInfo.name || "",
          lastName: userInfo.lastName || "",
          age: userInfo.age?.toString() || "",
          email: userInfo.email || "",
          password: ""
       });

      } catch (err) {
        console.error("Error obteniendo usuario:", err);
        setError("Error obteniendo datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ==============================
  // 🔹 Manejo de inputs
  // ==============================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ==============================
  // 🔹 Guardar cambios
  // ==============================
  const handleSave = async () => {
    if (!userId) return;

    try {
      await updateUser(userId, {
        ...form,
        age: Number(form.age),
      });

      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("Error guardando perfil:", err);
      alert("Error guardando perfil: " + err.message);
    }
  };

  // ==============================
  // 🔹 Eliminar cuenta
  // ==============================
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

  // ==============================
  // 🔹 Cerrar sesión
  // ==============================
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) return <div>Cargando perfil...</div>;

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
              name="firstName"
              disabled={!isEditing}
              value={form.firstName}
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
            <input className="auth-input" type="email" disabled value={form.email} />
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
