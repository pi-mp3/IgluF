// src/pages/MeetingRoom.tsx

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../services/useSocket";
//import { connectSocket } from "../services/socket";
interface ChatMessage {
  userId: string;
  text: string;
  timestamp: number;
}

export default function MeetingRoom() {
  const { id: meetingId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const socketRef = useRef<any>(null);

  // ⬇️ Conexión al socket y unión a la reunión
  useEffect(() => {
    async function connect() {
      try {
        const socket = await getSocket();
        socketRef.current = socket;

        // Unirse a la reunión
        socket.emit("joinMeeting", { meetingId });

        socket.on("meeting:participants", (list) => {
        setParticipants(list);
        });

        socket.on("userJoined", ({ userId }) =>
          setParticipants((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
        ));

        socket.on("receiveMessage", (msg) => {
          setMessages((prev) => [...prev, msg]);
    });


        socket.on("meeting:error", (err) => {
          console.error("⚠️ Meeting error:", err);
          alert(err.message || "Error al unirse a la reunión");
        });

        console.log("🔗 Joined meeting", meetingId);
      } catch (err) {
        console.error("Error inicializando MeetingRoom:", err);
      }
    }

    connect();

    return () => {
      socketRef.current?.off("userJoined");
      socketRef.current?.off("receiveMessage");
    };
  }, [meetingId]);

  const handleSend = () => {
    if (!input.trim()) return;

    socketRef.current.emit("sendMessage", {
      meetingId,
      text: input.trim(),
    });

    setInput("");
  };

  // Salir de la reunión
  const handleHangup = () => {
    navigate("/dashboard");
  };

  return (
    <div className="meeting-page">
      <div className="meeting-wrapper">
        {/* Header */}
        <header className="meeting-topbar">
          <div className="meeting-status-dot" />
          <span className="meeting-title">
            Reunión - ID: {meetingId ?? "----"}
          </span>
        </header>

        <div className="meeting-main">
          {/* Grid de participantes */}
          <section className="meeting-grid">
            {participants.map((uid) => (
              <article key={uid} className="meeting-tile">
                <div className="meeting-avatar-circle">
                  <span>{uid.slice(0, 1).toUpperCase()}</span>
                </div>
                <div className="meeting-participant-label">{uid}</div>
              </article>
            ))}

            {/* placeholders */}
            {Array.from({ length: 6 - participants.length }).map((_, idx) => (
              <article
                key={`placeholder-${idx}`}
                className="meeting-tile meeting-tile-empty"
              >
                <div className="meeting-empty-icon">👥</div>
              </article>
            ))}
          </section>

          {/* Chat */}
          <aside className="meeting-sidebar">
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">Chat</button>
              <button className="meeting-tab">
                Participantes ({participants.length})
              </button>
            </div>

            {/* Lista de mensajes */}
            <div className="meeting-chat-list">
              {messages.map((m, i) => (
                <div key={i} className="meeting-chat-message">
                  <div className="meeting-chat-meta">
                    <span className="meeting-chat-author">{m.userId}</span>
                    <span className="meeting-chat-time">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="meeting-chat-text">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="meeting-chat-input-wrapper">
              <input
                type="text"
                className="meeting-chat-input"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button className="meeting-chat-send" onClick={handleSend}>
                ➤
              </button>
            </div>
          </aside>
        </div>

        {/* Controles */}
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