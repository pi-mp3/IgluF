// src/pages/MeetingExplore.tsx
import React from "react";

export default function MeetingExplore() {
  return (
    <div className="explore-card">
      <h3 className="explore-title">Explorar Sala</h3>

      <div className="explore-grid">
        {/* Imagen izquierda */}
        <div className="explore-video">
          <img
            src="/assets/mock-video.jpg"
            alt="Vista previa del video"
            className="explore-image"
          />
        </div>

        {/* Imagen derecha */}
        <div className="explore-chat">
          <img
            src="/assets/mock-chat.jpg"
            alt="Vista previa del chat"
            className="explore-image"
          />
        </div>
      </div>
    </div>
  );
}
