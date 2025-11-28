/**
 * Header.tsx
 *
 * ORIGINAL UI + FIXED LOGOUT BEHAVIOR
 *
 * - Maintains your visual design exactly as you had it.
 * - Uses AuthContext for real session detection.
 * - Logout now works instantly thanks to improved AuthContext.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">

        {/* App Logo */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          {user ? (
            <>
              {/* Welcome user */}
              <span className="user-welcome">
                Hola {user.email?.split("@")[0]} 👋
              </span>

              {/* Dashboard */}
              <Link to="/dashboard" className="btn-link">
                Reuniones
              </Link>

              {/* Profile */}
              <Link to="/profile" className="btn-outline">
                Perfil
              </Link>

              {/* Logout */}
              <button className="btn-outline" onClick={logout}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link to="/login" className="btn-link">
                Iniciar Sesión
              </Link>

              {/* Register */}
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
