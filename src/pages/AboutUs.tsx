import React from "react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="about-page">
      
      {/* HERO / PRESENTACIÓN */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <p className="hero-eyebrow">Sobre Nosotros</p>
            <h1 className="hero-title">Iglú, conectando personas</h1>
            <p className="hero-subtitle">
              Somos una plataforma diseñada para que tus reuniones sean fluidas,
              eficientes y humanas. Videoconferencias en tiempo real con audio y
              video de alta calidad, sin complicaciones y accesibles desde cualquier lugar.
            </p>
          </div>

          <div className="hero-card">
            <img
              src="/logo.png"
              alt="Iglú Team"
              className="hero-logo"
            />
          </div>
        </div>
      </section>

      {/* NUESTRA MISIÓN */}
      <section className="section">
        <h2 className="section-title">Nuestra Misión</h2>
        <p className="section-text">
          Crear herramientas digitales confiables y simples que permitan a equipos,
          amigos, estudiantes y comunidades colaborar sin barreras.
          Iglú nació con la idea de reducir la fricción tecnológica
          y devolverle la esencia a las reuniones: la comunicación humana.
        </p>
      </section>

      {/* QUÉ OFRECEMOS */}
      <section className="section">
        <h2 className="section-title">Qué Ofrecemos</h2>
        <div className="sitemap-grid">
          <div className="card">
            <h3 className="card-title">Videollamadas fluidas</h3>
            <p className="card-text">
              Conexión estable, audio nítido y video en alta calidad,
              pensado para reuniones personales o corporativas.
            </p>
          </div>

          <div className="card">
            <h3 className="card-title">Reuniones rápidas</h3>
            <p className="card-text">
              Crea un ID y compártelo. Nada más.
              Entra con un clic sin complicaciones ni pasos extras.
            </p>
          </div>

          <div className="card">
            <h3 className="card-title">Productividad real</h3>
            <p className="card-text">
              Recopila notas, genera resúmenes y guarda reuniones
              para mantenerte enfocado y organizado.
            </p>
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="section">
        <h2 className="section-title">El equipo detrás de Iglú</h2>
        <p className="section-text">
          Somos un grupo de desarrolladores apasionados por crear productos digitales
          accesibles y de calidad. Nos mueve la idea de conectar personas sin importar
          dónde estén y cómo se comuniquen.
        </p>

        <div className="team-logo-container">
          <img src="/logo.png" alt="Iglú Logo" className="team-photo" />
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <h2 className="section-title">Únete a nuestra comunidad</h2>
        <p className="section-text">
          Empieza a usar Iglú hoy y descubre una nueva forma de reunirte.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="btn-primary">
            Comenzar Gratis
          </Link>
          <Link to="/login" className="btn-outline">
            Iniciar Sesión
          </Link>
        </div>
      </section>

    </div>
  );
}
