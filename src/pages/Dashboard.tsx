/**
 * Dashboard.tsx
 * 
 * Página principal del panel de control del usuario.
 * Permite crear reuniones nuevas, unirse a reuniones existentes
 * y visualizar reuniones recientes.
 * 
 * Nota: El botón de cerrar sesión ha sido removido del dashboard
 * y ahora se maneja desde el Header para mantener consistencia.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Meeting {
  id: string;
  date: string;
  time: string;
  participants: number;
  duration: string;
}

// Datos de ejemplo para reuniones recientes
const mockMeetings: Meeting[] = [
  { id: "ABC123XYZ", date: "14 Nov 2024", time: "14:30", participants: 5, duration: "45 min" },
  { id: "DEF456UVW", date: "13 Nov 2024", time: "10:00", participants: 3, duration: "30 min" },
  { id: "GHI789RST", date: "12 Nov 2024", time: "16:15", participants: 6, duration: "60 min" },
];

export default function DashboardPage() {
  const [joinId, setJoinId] = useState(""); // ID de reunión para unirse
  const navigate = useNavigate();

  /**
   * Genera un ID aleatorio de 7 caracteres para nuevas reuniones
   */
  const generateRandomId = (): string => {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  /**
   * Crea una reunión nueva y redirige a la página de la reunión
   */
  const handleCreateMeeting = (): void => {
    const id = generateRandomId();
    navigate(`/meeting/${id}`);
  };

  /**
   * Se une a una reunión existente usando el ID ingresado
   */
  const handleJoinMeeting = (): void => {
    const trimmed = joinId.trim();
    if (!trimmed) return;
    navigate(`/meeting/${trimmed}`);
  };

  /**
   * Copia el ID de reunión al portapapeles
   */
  const handleCopyId = (id: string): void => {
    navigator.clipboard.writeText(id).catch(() => {});
    alert(`ID de reunión ${id} copiado al portapapeles`);
  };

  /**
   * Función simulada para mostrar un resumen de IA de la reunión
   */
  const handleIaSummary = (id: string): void => {
    alert(`Aquí se mostraría el resumen de IA para la reunión ${id}`);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-wrapper">

        {/* Header interno del dashboard */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Panel de Control</h1>
            <p className="dashboard-subtitle">Crea o únete a una reunión</p>
          </div>
        </header>

        {/* Sección principal: Crear o unirse a reuniones */}
        <section className="dashboard-main-grid">

          {/* Tarjeta: Crear reunión */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-icon-circle"><span className="dashboard-icon">＋</span></div>
              <div>
                <h2 className="dashboard-card-title">Crear Reunión</h2>
                <p className="dashboard-card-text">
                  Genera un ID único y compártelo con los participantes.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={handleCreateMeeting}
            >
              Crear Nueva Reunión
            </button>
          </div>

          {/* Tarjeta: Unirse a reunión */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-icon-circle"><span className="dashboard-icon">🕒</span></div>
              <div>
                <h2 className="dashboard-card-title">Unirse a Reunión</h2>
                <p className="dashboard-card-text">
                  Ingresa el ID de la reunión para unirte.
                </p>
              </div>
            </div>

            <div className="dashboard-field-label">ID de Reunión</div>
            <input
              className="dashboard-input"
              placeholder="ABC123XYZ"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
            />

            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={handleJoinMeeting}
              disabled={!joinId.trim()}
            >
              Unirse Ahora
            </button>
          </div>
        </section>

        {/* Sección: Reuniones recientes */}
        <section className="dashboard-recent">
          <h2 className="dashboard-section-title">Reuniones Recientes</h2>

          <div className="dashboard-meetings-list">
            {mockMeetings.map((m) => (
              <article key={m.id} className="meeting-row">
                <div className="meeting-main">
                  <div className="meeting-avatar"><span>📹</span></div>
                  <div>
                    <div className="meeting-id">ID: {m.id}</div>
                    <div className="meeting-meta">
                      {m.date} · {m.time} · {m.participants} participantes · {m.duration}
                    </div>
                  </div>
                </div>

                <div className="meeting-actions">
                  <button
                    type="button"
                    className="meeting-ia-btn"
                    onClick={() => handleIaSummary(m.id)}
                  >
                    Resumen IA
                  </button>
                  <button
                    type="button"
                    className="meeting-copy-btn"
                    onClick={() => handleCopyId(m.id)}
                  >
                    Copiar ID
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
