import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Columna izquierda: marca + descripción */}
        <div className="footer-brand">
          <div className="footer-logo-wrapper">
            <img src="/logo.png" alt="Iglú" className="footer-logo" />
          </div>

          <p className="footer-desc">
            Plataforma de videoconferencias en tiempo real con chat, audio y video de alta calidad.
          </p>

          <div className="footer-icons">
            <span className="footer-icon" aria-hidden="true">🔔</span>
            <span className="footer-icon" aria-hidden="true">✉️</span>
          </div>
        </div>

        {/* Columna central: Producto */}
        <div className="footer-column">
          <h4 className="footer-title">Producto</h4>
          <ul className="footer-list">
            <li>Características</li>
            <li>Precios</li>
            <li>Documentación</li>
          </ul>
        </div>

        {/* Columna derecha: Empresa */}
        <div className="footer-column">
          <h4 className="footer-title">Empresa</h4>
          <ul className="footer-list">
            <li>Sobre Nosotros</li>
            <li>Contacto</li>
            <li>Privacidad</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 Iglú. Plataforma de videoconferencias.</span>
      </div>
    </footer>
  );
}
