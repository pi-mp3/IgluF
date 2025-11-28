// src/pages/AboutUs.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="about-page">

      {/* HERO SUPERIOR */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div>
            <p className="about-eyebrow">Sobre Nosotros</p>
            <h1 className="about-title">Iglú: conectando personas sin barreras</h1>
            <p className="about-subtitle">
              Creamos experiencias de comunicación simples, humanas y de alta calidad.
              Iglú nace para facilitar reuniones fluidas sin importar el lugar o el dispositivo.
            </p>
          </div>

          <div className="about-hero-logo-wrapper">
            <img src="/logo.png" alt="Iglú Logo" className="about-hero-logo" />
          </div>
        </div>
      </section>

      {/* NUESTRA MISIÓN */}
      <section className="about-section">
        <h2 className="about-section-title">Nuestra misión</h2>
        <p className="about-section-text">
          Diseñamos herramientas digitales confiables que permiten a personas y equipos
          comunicarse sin fricción. Buscamos eliminar barreras tecnológicas para ofrecer
          videoconferencias claras, accesibles y modernas.
        </p>
      </section>

      {/* QUÉ OFRECEMOS */}
      <section className="about-section">
        <h2 className="about-section-title">Qué ofrecemos</h2>

        <div className="about-grid">
          <div className="about-card">
            <h3 className="about-card-title">Videollamadas de calidad</h3>
            <p className="about-card-text">
              Audio limpio, video nítido y conexión estable para reuniones profesionales,
              clases, presentaciones y más.
            </p>
          </div>

          <div className="about-card">
            <h3 className="about-card-title">Reuniones rápidas</h3>
            <p className="about-card-text">
              Crea un ID único y comparte el enlace. Nada más. Sin fricción,
              sin configuraciones complicadas.
            </p>
          </div>

          <div className="about-card">
            <h3 className="about-card-title">Herramientas inteligentes</h3>
            <p className="about-card-text">
              Resúmenes automáticos con IA, notas, historial y más funciones
              para mejorar tu productividad.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="about-section">
        <div className="about-cta-card">
          <h2 className="about-section-title">Únete a nuestra comunidad</h2>

          <p className="about-section-text">
            Empieza a usar Iglú hoy y descubre una forma clara, moderna y ordenada de reunirte.
          </p>

          <div className="about-cta-actions">
            <Link to="/register" className="btn-outline-dark">
              Comenzar Gratis
            </Link>

            <Link to="/login" className="btn-outline-dark">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
