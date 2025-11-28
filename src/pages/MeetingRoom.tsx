// src/pages/MeetingRoom.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../services/useSocket";
import { sendMessage, subscribeToMessages } from "../services/chatService";
import { ChatMessage } from "../types/chat";

export default function MeetingRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const socket = useSocket(id!);

  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /** Receive live messages */
  useEffect(() => {
    subscribeToMessages(socket, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, [socket]);

  /** Send new message */
  const handleSend = () => {
    if (!text.trim()) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      author: "Tú",
      text,
      time: new Date().toLocaleTimeString(),
    };

    sendMessage(socket, msg);
    setMessages((prev) => [...prev, msg]);
    setText("");
  };

  /** Exit meeting */
  const handleHangup = () => {
    navigate("/dashboard");
  };

  return (
    <div className="meeting-page">
      <div className="meeting-wrapper">

        <header className="meeting-topbar">
          <div className="meeting-status-dot" />
          <span className="meeting-title">Reunión - ID: {id}</span>
        </header>

        <div className="meeting-main">
          {/* Mantengo tu grid tal cual */}
          <section className="meeting-grid">
            {/* …tu contenido original sin tocar… */}
          </section>

          {/* Chat real */}
          <aside className="meeting-sidebar">
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">Chat</button>
              <button className="meeting-tab">Participantes</button>
              <button className="meeting-tab">IA</button>
            </div>

            <div className="meeting-chat-list">
              {messages.map((m) => (
                <div key={m.id} className="meeting-chat-message">
                  <div className="meeting-chat-meta">
                    <span className="meeting-chat-author">{m.author}</span>
                    <span className="meeting-chat-time">{m.time}</span>
                  </div>
                  <p className="meeting-chat-text">{m.text}</p>
                </div>
              ))}
            </div>

            <div className="meeting-chat-input-wrapper">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="meeting-chat-input"
                placeholder="Escribe un mensaje..."
              />
              <button className="meeting-chat-send" onClick={handleSend}>➤</button>
            </div>
          </aside>
        </div>

        <footer className="meeting-toolbar">
          <div className="meeting-toolbar-center">
            {/* tus botones originales */}
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
