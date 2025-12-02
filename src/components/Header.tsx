/**
 * Header.tsx
 *
 * Versión sin el botón "Crear Reunión" en el header.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          {loading ? (
            <span className="header-loading">Cargando sesión...</span>
          ) : user ? (
            <>
              {/* Después de login */}
              <span className="user-welcome">
                Hola {user.email?.split("@")[0]} 👋
              </span>

              <Link to="/dashboard" className="btn-pill btn-pill--outline">
                Reuniones
              </Link>

              {/* Botón "Crear Reunión" eliminado del header */}

              <Link to="/profile" className="btn-pill btn-pill--outline">
                Perfil
              </Link>

              <button
                className="btn-pill btn-pill--outline"
                onClick={logout}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              {/* Antes de login */}
              <Link to="/about-us" className="btn-pill btn-pill--outline">
                Sobre Nosotros
              </Link>

              <Link to="/login" className="btn-pill btn-pill--outline">
                Iniciar Sesión
              </Link>

              <Link to="/register" className="btn-pill btn-pill--outline">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
