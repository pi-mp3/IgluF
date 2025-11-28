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

  // ================================
  // ✨ Capturar usuario Firebase
  // ================================
  useEffect(() => {
    console.log("Profile Mount: escuchando auth...");

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth changed:", firebaseUser);

      if (!firebaseUser) {
        console.warn("NO hay usuario logeado → redirect login");
        navigate("/login");
        return;
      }

      console.log("Usuario UID:", firebaseUser.uid);
      setUserId(firebaseUser.uid);

      setForm((prev) => ({
        ...prev,
        email: firebaseUser.email || "",
      }));
    });

    return () => unsubscribe();
  }, [navigate]);

  // ================================
  // ✨ Pedir al backend el perfil
  // ================================
  useEffect(() => {
    if (!userId) return;

    console.log("🔎 Fetch Backend → getUserById(", userId, ")");

    const fetchUser = async () => {
      try {
        const data = await getUserById(userId);
        console.log("📦 Respuesta backend:", data);

        if (!data) {
          console.warn("Backend NO devolvió datos → perfil vacío");
          setError("No hay datos en backend. Completa tu perfil.");
          setIsEditing(true);
          setLoading(false);
          return;
        }

        // Validar campos
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          age: data.age || "",
          email: data.email || "",
          password: "",
        });
      } catch (err: any) {
        console.error("❌ Error al traer datos:", err);
        setError("No se pudo cargar el perfil desde el backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ================================
  // 🔹 Input
  // ================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(`Input changed → ${name}:`, value);

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ================================
  // 🔹 Guardar
  // ================================
  const handleSave = async () => {
    if (!userId) return;

    console.log("💾 Guardando cambios:", form);

    try {
      await updateUser(userId, {
        ...form,
        age: Number(form.age),
      });

      setIsEditing(false);
      alert("Perfil actualizado correctamente");
    } catch (err: any) {
      console.error("❌ Error al guardar:", err);
      alert("Error al guardar: " + err.message);
    }
  };

  // ================================
  // 🔹 Eliminar cuenta
  // ================================
  const handleDelete = async () => {
    if (!userId) return;
    if (!window.confirm("¿Seguro que quieres eliminar tu cuenta?")) return;

    console.log("🚮 Eliminando usuario:", userId);

    try {
      await deleteUser(userId);
      await signOut(auth);
      navigate("/login");
    } catch (err: any) {
      alert("Error eliminando usuario: " + err.message);
    }
  };

  // ================================
  // 🔹 Logout
  // ================================
  const handleLogout = async () => {
    console.log("🔐 Logout");
    await signOut(auth);
    navigate("/login");
  };

  // ================================
  // Vistas de estado
  // ================================
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
