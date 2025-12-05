/**
 * MeetingRoom Component
 * Main meeting interface with real-time chat and audio streaming
 * Handles Socket.IO connection, participant management, and Web Audio API
 */

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../services/useSocket";
import { useAuth } from "../context/AuthContext";

/** Chat message structure */
interface ChatMessage {
  userId: string;
  text: string;
  timestamp: number;
}

/** Participant metadata */
interface Participant {
  uid: string;
  name?: string;
}

/**
 * Meeting room page component
 * Provides real-time chat, audio streaming, and participant list
 * Automatically connects to Socket.IO server on mount
 * 
 * @returns {JSX.Element} Meeting room interface
 */
export default function MeetingRoom() {
  const { id: meetingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);

  // Conexión al socket y unión a la reunión
  useEffect(() => {
    if (!meetingId || !user) return;

    async function connect() {
      setIsConnecting(true);
      setConnectionError(null);
      
      try {
        const socket = await getSocket();
        socketRef.current = socket;

        // Limpiar listeners anteriores si existen
        socket.off("meeting:participants");
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("receiveMessage");
        socket.off("audio:stream");
        socket.off("meeting:error");

        // Recibir lista inicial de participantes
        socket.on("meeting:participants", (list: Participant[]) => {
          setParticipants(list);
        });

        // Usuario se unió
        socket.on("userJoined", ({ userId, userName }: { userId: string; userName?: string }) => {
          setParticipants((prev) => {
            if (prev.some(p => p.uid === userId)) return prev;
            return [...prev, { uid: userId, name: userName }];
          });
        });

        // Usuario salió
        socket.on("userLeft", ({ userId }: { userId: string }) => {
          setParticipants((prev) => prev.filter(p => p.uid !== userId));
        });

        // Recibir mensajes de chat
        socket.on("receiveMessage", (msg: ChatMessage) => {
          setMessages((prev) => [...prev, msg]);
        });

        // Recibir audio de otros participantes
        socket.on("audio:stream", async ({ userId, audioData }: { userId: string; audioData: ArrayBuffer }) => {
          await playReceivedAudio(audioData);
        });

        // Errores
        socket.on("meeting:error", (err: any) => {
          console.error("⚠️ Meeting error:", err);
          alert(err.message || "Error al unirse a la reunión");
        });

        // Unirse a la reunión DESPUÉS de configurar listeners
        socket.emit("joinMeeting", { meetingId, userName: user.name || user.email });

        setIsConnected(true);
        setIsConnecting(false);
        console.log("✅ Conectado exitosamente a reunión:", meetingId);
      } catch (err: any) {
        console.error("❌ Error inicializando MeetingRoom:", err);
        console.error("Detalles del error:", err.message, err.stack);
        
        const errorMsg = err.message || "Error desconocido";
        setConnectionError(errorMsg);
        setIsConnecting(false);
        
        // Si el error es de autenticación, redirigir al login después de 3 segundos
        if (errorMsg.includes("No hay sesión") || errorMsg.includes("Token") || errorMsg.includes("autenticado")) {
          setTimeout(() => navigate("/login"), 3000);
        }
      }
    }

    connect();

    return () => {
      // Cleanup
      if (socketRef.current) {
        socketRef.current.emit("leaveMeeting", { meetingId });
        socketRef.current.off("meeting:participants");
        socketRef.current.off("userJoined");
        socketRef.current.off("userLeft");
        socketRef.current.off("receiveMessage");
        socketRef.current.off("audio:stream");
        socketRef.current.off("meeting:error");
      }
      stopAudio();
    };
  }, [meetingId, user]);

  /**
   * Starts audio capture from user's microphone
   * Uses Web Audio API with ScriptProcessorNode to capture audio chunks
   * Sends Float32 audio samples to server via Socket.IO when not muted
   * 
   * @async
   * @returns {Promise<void>}
   */
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        
        const audioData = e.inputBuffer.getChannelData(0);
        // Convertir Float32Array a ArrayBuffer
        const buffer = new ArrayBuffer(audioData.length * 4);
        const view = new Float32Array(buffer);
        view.set(audioData);
        
        // Enviar audio al servidor
        if (socketRef.current?.connected) {
          socketRef.current.emit("audio:stream", {
            meetingId,
            audioData: Array.from(audioData) // Convertir a array normal para JSON
          });
        }
      };
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      setIsMuted(false);
    } catch (err) {
      console.error("❌ Error al iniciar audio:", err);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  /**
   * Stops audio capture and releases microphone resources
   * Closes AudioContext and stops all MediaStream tracks
   */
  const stopAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  /**
   * Plays received audio data from remote participants
   * Converts Float32 array to AudioBuffer and plays through speakers
   * 
   * @async
   * @param {number[]} audioData - Float32 audio samples from remote user
   * @returns {Promise<void>}
   */
  const playReceivedAudio = async (audioData: number[]) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }
      
      const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 16000);
      const channelData = audioBuffer.getChannelData(0);
      channelData.set(audioData);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (err) {
      // Silent fail on audio playback errors
    }
  };

  /**
   * Toggles microphone mute state
   * When muted, audio capture continues but transmission stops
   */
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Enviar mensaje de chat
  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      meetingId,
      text: input.trim(),
    });

    setInput("");
  };

  // Salir de la reunión
  const handleHangup = () => {
    stopAudio();
    if (socketRef.current) {
      socketRef.current.emit("leaveMeeting", { meetingId });
    }
    navigate("/dashboard");
  };

  // Pantalla de carga/error
  if (isConnecting) {
    return (
      <div className="meeting-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <h2>Conectando a la reunión...</h2>
          <p style={{ color: '#666' }}>ID: {meetingId}</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="meeting-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '500px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
          <h2>Error al conectar</h2>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{connectionError}</p>
          <button 
            onClick={() => navigate("/dashboard")} 
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'var(--teal)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

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
            {participants.map((participant) => (
              <article key={participant.uid} className="meeting-tile">
                <div className="meeting-avatar-circle">
                  <span>{(participant.name || participant.uid).slice(0, 1).toUpperCase()}</span>
                </div>
                <div className="meeting-participant-label">
                  {participant.name || participant.uid}
                  {participant.uid === user?.uid && " (Tú)"}
                </div>
              </article>
            ))}

            {/* placeholders */}
            {Array.from({ length: Math.max(0, 6 - participants.length) }).map((_, idx) => (
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
            <button 
              className={`meeting-control-btn ${isMuted ? 'muted' : ''}`}
              onClick={toggleMute}
              title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            >
              {isMuted ? "🔇" : "🎙️"}
            </button>
            
            <button 
              className="meeting-control-btn"
              onClick={mediaStreamRef.current ? stopAudio : startAudio}
              title={mediaStreamRef.current ? "Detener audio" : "Iniciar audio"}
            >
              {mediaStreamRef.current ? "⏹️" : "▶️"}
            </button>

            <button className="meeting-control-btn" disabled title="Video (Sprint 4)">
              📷
            </button>

            <button className="meeting-control-btn" title="Compartir pantalla">
              🖥️
            </button>

            <button className="meeting-control-btn" title={`${participants.length} participantes`}>
              👥 {participants.length}
            </button>

            <button 
              className={`meeting-control-btn ${isConnected ? 'connected' : 'disconnected'}`}
              title={isConnected ? "Conectado" : "Desconectado"}
            >
              {isConnected ? "🟢" : "🔴"}
            </button>

            <button
              className="meeting-control-btn meeting-control-hangup"
              onClick={handleHangup}
              title="Salir de la reunión"
            >
              ✖
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}