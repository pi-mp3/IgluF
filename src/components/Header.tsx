/**
 * Header.tsx
 * 
 * Componente de cabecera de la aplicación.
 * Muestra el logo, navegación y botones de usuario.
 * 
 * Si el usuario está logueado:
 *   - Saludo con su correo
 *   - Acceso al dashboard, perfil y logout
 * Si no está logueado:
 *   - Botones para iniciar sesión o registrarse
 */

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo de la app */}
        <Link to="/" className="header-logo">
          <img src="/logo.png" alt="Iglú Logo" />
          <span>Iglú</span>
        </Link>

        <nav className="header-nav">
          {user ? (
            <>
              {/* Saludo al usuario */}
              <span className="user-welcome">
                Hola {user.email?.split("@")[0]} 👋
              </span>

              {/* Botones de navegación */}
              <Link to="/dashboard" className="btn-link dashboard-primary-btn">
                Reuniones
              </Link>

              <Link to="/profile" className="btn-outline dashboard-secondary-btn">
                Perfil
              </Link>

              {/* Botón de cerrar sesión */}
              <button
                className="btn-outline dashboard-secondary-btn"
                onClick={logout}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              {/* Usuario no autenticado */}
              <Link to="/login" className="btn-link dashboard-primary-btn">
                Iniciar Sesión
              </Link>

              <Link to="/register" className="btn-outline dashboard-secondary-btn">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
