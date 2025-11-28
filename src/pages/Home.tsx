// src/pages/Home.tsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import MeetingExplore from "../widgets/MeetingExplore";

export default function Home(): JSX.Element {
  const navigate = useNavigate();

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="hero-eyebrow">Videoconferencias que conectan equipos</p>
            <h1 className="hero-title">Videoconferencias que conectan equipos</h1>
            <p className="hero-subtitle">
              Iglú es la plataforma de videoconferencias en tiempo real con chat,
              audio y video de alta calidad. Simple, rápida y confiable.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn-pill btn-pill--primary"
                onClick={() => navigate("/register")}
              >
                Comenzar Gratis
              </button>
              <button
                type="button"
                className="btn-pill btn-pill--outline"
                onClick={() => navigate("/login")}
              >
                Iniciar Sesión
              </button>
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
              <li>
                <Link to="/register" className="card-link auth-link">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link to="/login" className="card-link auth-link">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Reuniones</h3>
            <ul className="card-list">
              <li>
                <Link to="/dashboard" className="card-link auth-link">
                  Crear reuniones
                </Link>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Perfil</h3>
            <ul className="card-list">
              <li>
                <Link to="/profile" className="card-link auth-link">
                  Ver perfil
                </Link>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="card-title">Conócenos aquí</h3>
            <ul className="card-list">
              <li>
                <Link to="/about-us" className="card-link auth-link">
                  Sobre nosotros
                </Link>
              </li>
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
