import React from 'react';

export default function Header() {
  return (
    <header className="header-bar">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="Iglú" />
          <span>Iglú</span>
        </div>

        <nav className="header-nav">
          {/* Más adelante estos irán a /login y /register con React Router */}
          <button className="header-link">Iniciar Sesión</button>
          <button className="header-cta">Registrarse</button>
        </nav>
      </div>
    </header>
  );
}
