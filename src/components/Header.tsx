import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
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
          <Link to="/login" className="btn-link">
            Iniciar Sesión
          </Link>

          <Link to="/register" className="btn-outline">
            Registrarse
          </Link>
        </nav>
      </div>
    </header>
  );
}
