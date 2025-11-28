// src/pages/Dashboard.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Meeting {
  id: string;
  date: string;
  time: string;
  participants: number;
  duration: string;
}

const mockMeetings: Meeting[] = [
  {
    id: "ABC123XYZ",
    date: "14 Nov 2024",
    time: "14:30",
    participants: 5,
    duration: "45 min",
  },
  {
    id: "DEF456UVW",
    date: "13 Nov 2024",
    time: "10:00",
    participants: 3,
    duration: "30 min",
  },
  {
    id: "GHI789RST",
    date: "12 Nov 2024",
    time: "16:15",
    participants: 6,
    duration: "60 min",
  },
];

export default function DashboardPage(): JSX.Element {
  const [joinId, setJoinId] = useState("");
  const navigate = useNavigate();

  const generateRandomId = (): string => {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  const handleCreateMeeting = (): void => {
    const id = generateRandomId();
    navigate(`/meeting/${id}`);
  };

  const handleJoinMeeting = (): void => {
    const trimmed = joinId.trim();
    if (!trimmed) return;
    navigate(`/meeting/${trimmed}`);
  };

  const handleCopyId = (id: string): void => {
    navigator.clipboard.writeText(id).catch(() => {});
    alert(`Meeting ID ${id} copied to clipboard`);
  };

  const handleIaSummary = (id: string): void => {
    alert(`Here you would show the AI summary for meeting ${id}`);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-wrapper">
        {/* HEADER DEL PANEL (ya sin botón rojo de logout) */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Control Panel</h1>
            <p className="dashboard-subtitle">Create or join a meeting</p>
          </div>
        </header>

        {/* GRID SUPERIOR: CREAR / UNIRSE */}
        <section className="dashboard-main-grid">
          {/* Tarjeta: Crear reunión */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-icon-circle">
                <span className="dashboard-icon">＋</span>
              </div>
              <div>
                <h2 className="dashboard-card-title">Create Meeting</h2>
                <p className="dashboard-card-text">
                  Generate a unique ID and share it with participants.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={handleCreateMeeting}
            >
              Create New Meeting
            </button>
          </div>

          {/* Tarjeta: Unirse a reunión */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="dashboard-icon-circle">
                <span className="dashboard-icon">🕒</span>
              </div>
              <div>
                <h2 className="dashboard-card-title">Join Meeting</h2>
                <p className="dashboard-card-text">
                  Enter the meeting ID to join.
                </p>
              </div>
            </div>

            <div className="dashboard-field-label">Meeting ID</div>
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
              Join Now
            </button>
          </div>
        </section>

        {/* REUNIONES RECIENTES */}
        <section className="dashboard-recent">
          <h2 className="dashboard-section-title">Recent Meetings</h2>

          <div className="dashboard-meetings-list">
            {mockMeetings.map((m) => (
              <article key={m.id} className="meeting-row">
                <div className="meeting-main">
                  <div className="meeting-avatar">
                    <span>📹</span>
                  </div>
                  <div>
                    <div className="meeting-id">ID: {m.id}</div>
                    <div className="meeting-meta">
                      {m.date} · {m.time} · {m.participants} participants ·{" "}
                      {m.duration}
                    </div>
                  </div>
                </div>

                <div className="meeting-actions">
                  <button
                    type="button"
                    className="meeting-ia-btn"
                    onClick={() => handleIaSummary(m.id)}
                  >
                    AI Summary
                  </button>
                  <button
                    type="button"
                    className="meeting-copy-btn"
                    onClick={() => handleCopyId(m.id)}
                  >
                    Copy ID
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
