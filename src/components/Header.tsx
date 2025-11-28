/**
 * Header.tsx
 *
 * UPDATED: All pre-login buttons consistent.
 * "Crear Reunión" post-login highlighted.
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
              {/* After login */}
              <span className="user-welcome">
                Hola {user.email?.split("@")[0]} 👋
              </span>

              <Link to="/dashboard" className="btn-pill btn-pill--outline">
                Reuniones
              </Link>

              <Link
                to="/crear-reunion"
                className="btn-pill btn-pill--solid" // destacado
              >
                Crear Reunión
              </Link>

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
              {/* Before login → all same style */}
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
