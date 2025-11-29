import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user,loading, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        <nav className="header-nav">
          {user ? (
            <>
              <span className="user-welcome">
                Hola {user.email?.split("@")[0]} 👋
              </span>

              <Link to="/dashboard" className="btn-link">
                Reuniones
              </Link>

              <Link to="/profile" className="btn-outline">
                Perfil
              </Link>

        
                <Link to="/" className="btn-link" onClick={logout}>
                Cerrar Sesión
                </Link>
                
            </>
          ) : (
            <>
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
