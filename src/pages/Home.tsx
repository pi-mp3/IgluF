import React from 'react';
import { Link } from 'react-router-dom';
import MeetingExplore from '../widgets/MeetingExplore';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="hero-eyebrow">Videoconferencias que conectan equipos</p>
            <h1 className="hero-title">Videoconferencias que conectan equipos</h1>
            <p className="hero-subtitle">
              Iglú es la plataforma de videoconferencias en tiempo real con chat, audio y video de
              alta calidad. Simple, rápida y confiable.
            </p>

            <div className="hero-actions">
              {/* Ir a registro */}
              <Link to="/register" className="btn-primary">
                Comenzar Gratis
              </Link>
              {/* Ir a login */}
              <Link to="/login" className="btn-outline">
                Iniciar Sesión
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <img src="/logo.png" alt="Iglú Logo" className="hero-logo" />
          </div>
        </div>
      </section>

      {/* MAPA DEL SITIO */}
      <section className="section">
        <h2 className="section-title">Mapa del Sitio</h2>

        <div className="sitemap-grid">
          <div className="card">
            <h3 className="card-title">Autenticación</h3>
            <ul className="card-list">
              <li>Registro</li>
              <li>Iniciar sesión</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Reuniones</h3>
            <ul className="card-list">
              <li>Crear reunión</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Perfil</h3>
            <ul className="card-list">
              <li>Ver perfil</li>
            </ul>
          </div>
        </div>
      </section>

      {/* EXPLORAR SALA */}
      <section className="section">
        <MeetingExplore />
      </section>
    </>
  );
}
