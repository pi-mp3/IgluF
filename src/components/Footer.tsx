import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" style={{ backgroundColor: '#1a1a1a', color: '#fff', padding: '2rem 1rem' }}>
      <div className="footer-inner" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Columna izquierda: marca + descripción */}
        <div className="footer-brand" style={{ flex: '1', minWidth: '200px', marginBottom: '1rem' }}>
          <div className="footer-logo-wrapper">
            <img src="/logo.png" alt="Iglú" className="footer-logo" style={{ width: '100px' }} />
          </div>

          <p className="footer-desc" style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>
            Plataforma de videoconferencias en tiempo real con chat, audio y video de alta calidad.
          </p>

          <div className="footer-icons" style={{ marginTop: '0.5rem' }}>
            <span className="footer-icon" aria-hidden="true" style={{ marginRight: '0.5rem' }}>🔔</span>
            <span className="footer-icon" aria-hidden="true">✉️</span>
          </div>
        </div>

        {/* Columna central: Producto */}
        <div className="footer-column" style={{ flex: '1', minWidth: '150px', marginBottom: '1rem' }}>
          <h4 className="footer-title" style={{ marginBottom: '0.5rem' }}>Producto</h4>
          <ul className="footer-list" style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
            <li>Características</li>
            <li>Precios</li>
            <li>
              <a
                href="/📘 MANUAL DE USUARIO – Plataforma de Videoconferencias.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                Documentación
              </a>
            </li>
          </ul>
        </div>

        {/* Columna derecha: Empresa */}
        <div className="footer-column" style={{ flex: '1', minWidth: '150px', marginBottom: '1rem' }}>
          <h4 className="footer-title" style={{ marginBottom: '0.5rem' }}>Empresa</h4>
          <ul className="footer-list" style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
            <li>Sobre Nosotros</li>
            <li>Contacto</li>
            <li>Privacidad</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <span>© 2025 Iglú. Plataforma de videoconferencias.</span>
      </div>
    </footer>
  );
}
