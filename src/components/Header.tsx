import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  // Detectar sesión activa
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsub();
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo + nombre */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        {/* Botones derecha */}
        <nav className="header-nav">
          {user ? (
            <>
              {/* Usuario logueado */}
              <Link to="/dashboard" className="btn-link">
                Reuniones
              </Link>

              <Link to="/profile" className="btn-outline">
                Perfil
              </Link>
            </>
          ) : (
            <>
              {/* Usuario NO logueado */}
              <Link to="/login" className="btn-link">
                Iniciar Sesión
              </Link>

              <Link to="/register" className="btn-outline">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
