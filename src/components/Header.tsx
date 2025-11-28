// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header(): JSX.Element {
  const { user, loading, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        {/* Navegación derecha */}
        <nav className="header-nav">
          {/* Sobre nosotros → visible siempre */}
          <Link to="/about-us" className="btn-pill btn-pill--outline">
            Sobre nosotros
          </Link>

          {loading ? (
            <span className="header-loading">Cargando sesión...</span>
          ) : user ? (
            <>
              <span className="user-welcome">
                Hola {user.email?.split("@")[0]} 👋
              </span>

              <Link
                to="/dashboard"
                className="btn-pill btn-pill--outline"
              >
                Reuniones
              </Link>

              <Link
                to="/profile"
                className="btn-pill btn-pill--outline"
              >
                Perfil
              </Link>

              <button
                type="button"
                className="btn-pill btn-pill--primary"
                onClick={logout}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn-pill btn-pill--outline"
              >
                Iniciar Sesión
              </Link>

              <Link
                to="/register"
                className="btn-pill btn-pill--primary"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
