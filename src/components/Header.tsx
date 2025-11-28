/**
 * Header.tsx
 *
 * UPDATED: Show "Sobre Nosotros" only before login.
 * Add "Crear Reunión" after login.
 * Maintains button style consistency and AuthContext session detection.
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

              <Link to="/dashboard" className="btn-link">
                Reuniones
              </Link>

              <Link to="/crear-reunion" className="btn-pill btn-pill--primary">
                Crear Reunión
              </Link>

              <Link to="/profile" className="btn-outline">
                Perfil
              </Link>

              <button className="btn-outline" onClick={logout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              {/* Before login */}
              <Link to="/about-us" className="btn-pill btn-pill--outline">
                Sobre Nosotros
              </Link>

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
