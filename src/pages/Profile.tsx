import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getUserById, updateUser, deleteUser } from "./api";

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

  // 🔥 Detectar usuario Firebase
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

  // 🔥 Obtener datos del backend
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
          password: "",
        });
      } catch (err: any) {
        setError(err.message);
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
  try {
    await updateUser(userId, {
      ...form,
      age: Number(form.age),   // 🔥 convertir edad de string → número
    });

    setIsEditing(false);
    alert("Perfil actualizado correctamente");
  } catch (err: any) {
    alert(err.message);
  }
};

  const handleDelete = async () => {
    if (!userId) return;
    if (!window.confirm("¿Seguro que quieres eliminar tu cuenta?")) return;

    try {
      await deleteUser(userId);
      await signOut(auth);
      alert("Cuenta eliminada");
      navigate("/login");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) return <div>Cargando perfil...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <h1 className="auth-title">Mi Perfil</h1>

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
            Email
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
