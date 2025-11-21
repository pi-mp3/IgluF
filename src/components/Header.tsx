// src/components/Header.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-inner">
        {/* LOGO: lleva al Home */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        {/* NAV DERECHA */}
        <nav className="header-nav">
          {/* Solo muestro "Iniciar Sesión" si NO estoy ya en /login */}
          {location.pathname !== "/login" && (
            <Link to="/login" className="btn-link">
              Iniciar Sesión
            </Link>
          )}

          {/* Solo muestro "Registrarse" si NO estoy ya en /register */}
          {location.pathname !== "/register" && (
            <Link to="/register" className="btn-outline">
              Registrarse
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
