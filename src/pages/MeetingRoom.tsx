// src/pages/MeetingRoom.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const participants = [
  { id: 1, name: "Usuario 1", label: "U" },
  { id: 2, name: "Usuario 2", label: "U" },
  { id: 3, name: "Tú", label: "T" },
];

const chatMessages = [
  { id: 1, author: "Usuario 1", time: "14:30", text: "¡Hola a todos!" },
  { id: 2, author: "Usuario 2", time: "14:31", text: "Hola, ¿pueden verme?" },
  { id: 3, author: "Tú", time: "14:32", text: "Sí, te vemos perfectamente" },
];

export default function MeetingRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /** 🔴 Salir de la reunión */
  const handleHangup = () => {
    navigate("/dashboard");
  };

  return (
    <div className="meeting-page">
      <div className="meeting-wrapper">
        {/* Barra superior */}
        <header className="meeting-topbar">
          <div className="meeting-status-dot" />
          <span className="meeting-title">
            Reunión - ID: {id ?? "ABC123XYZ"}
          </span>
        </header>

        {/* Contenido principal */}
        <div className="meeting-main">
          {/* Grid de participantes */}
          <section className="meeting-grid">
            {participants.map((p) => (
              <article key={p.id} className="meeting-tile">
                <div className="meeting-avatar-circle">
                  <span>{p.label}</span>
                </div>
                <div className="meeting-participant-label">{p.name}</div>
              </article>
            ))}

            {/* Lugares vacíos (placeholders) */}
            {Array.from({ length: 3 }).map((_, idx) => (
              <article
                key={`placeholder-${idx}`}
                className="meeting-tile meeting-tile-empty"
              >
                <div className="meeting-empty-icon">👥</div>
              </article>
            ))}
          </section>

          {/* Panel lateral (Chat) */}
          <aside className="meeting-sidebar">
            {/* Tabs */}
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">Chat</button>
              <button className="meeting-tab">Participantes (3)</button>
              <button className="meeting-tab">IA</button>
            </div>

            {/* Lista de mensajes */}
            <div className="meeting-chat-list">
              {chatMessages.map((m) => (
                <div key={m.id} className="meeting-chat-message">
                  <div className="meeting-chat-meta">
                    <span className="meeting-chat-author">{m.author}</span>
                    <span className="meeting-chat-time">{m.time}</span>
                  </div>
                  <p className="meeting-chat-text">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input de mensaje */}
            <div className="meeting-chat-input-wrapper">
              <input
                type="text"
                className="meeting-chat-input"
                placeholder="Escribe un mensaje..."
              />
              <button className="meeting-chat-send">➤</button>
            </div>
          </aside>
        </div>

        {/* Barra de controles inferior */}
        <footer className="meeting-toolbar">
          <div className="meeting-toolbar-center">
            <button className="meeting-control-btn">🎙️</button>
            <button className="meeting-control-btn">📷</button>
            <button className="meeting-control-btn">🖥️</button>
            <button className="meeting-control-btn">👥</button>
            <button className="meeting-control-btn">⚙️</button>

            <button className="meeting-control-btn meeting-control-ia">
              Resumen IA
            </button>

            {/* 🔴 Botón para colgar y volver al Dashboard */}
            <button
              className="meeting-control-btn meeting-control-hangup"
              onClick={handleHangup}
            >
              ✖
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
