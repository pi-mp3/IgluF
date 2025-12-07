/**
 * MeetingRoom Component
 * Main meeting interface with real-time chat, audio/video streaming
 * Handles Socket.IO connection, participant management, Web Audio API and WebRTC
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
 * MeetingRoom component
 * Provides real-time chat, audio/video streaming, participant list
 * Automatically connects to Socket.IO server and initializes WebRTC
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
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // ICE servers configuration
  const iceServers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // Connect to socket and join meeting
  useEffect(() => {
    if (!meetingId || !user) return;

    async function connect() {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        const socket = await getSocket();
        socketRef.current = socket;

        // Clean previous listeners
        socket.off("meeting:participants");
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("receiveMessage");
        socket.off("audio:stream");
        socket.off("video-offer");
        socket.off("video-answer");
        socket.off("ice-candidate");
        socket.off("meeting:error");

        // Initial participants list
        socket.on("meeting:participants", (list: Participant[]) => {
          setParticipants(list);
        });

        // Participant joined
        socket.on("userJoined", ({ userId, userName }: { userId: string; userName?: string }) => {
          setParticipants((prev) => {
            if (prev.some((p) => p.uid === userId)) return prev;
            return [...prev, { uid: userId, name: userName }];
          });
        });

        // Participant left
        socket.on("userLeft", ({ userId }: { userId: string }) => {
          setParticipants((prev) => prev.filter((p) => p.uid !== userId));
        });

        // Receive chat messages
        socket.on("receiveMessage", (msg: ChatMessage) => {
          setMessages((prev) => [...prev, msg]);
        });

        // Audio stream from others
        socket.on("audio:stream", async ({ audioData }: { audioData: number[] }) => {
          await playReceivedAudio(audioData);
        });

        // WebRTC video signaling
        socket.on("video-offer", async (data: any) => {
          await handleVideoOffer(data);
        });
        socket.on("video-answer", async (data: any) => {
          await handleVideoAnswer(data);
        });
        socket.on("ice-candidate", async (data: any) => {
          if (peerConnectionRef.current) {
            try {
              await peerConnectionRef.current.addIceCandidate(data.candidate);
            } catch (err) {
              console.error("❌ ICE candidate error:", err);
            }
          }
        });

        // Error handling
        socket.on("meeting:error", (err: any) => {
          console.error("⚠️ Meeting error:", err);
          alert(err.message || "Error al unirse a la reunión");
        });

        // Join meeting after listeners
        socket.emit("joinMeeting", { meetingId, userName: user.name || user.email });

        setIsConnected(true);
        setIsConnecting(false);
        console.log("✅ Conectado exitosamente a reunión:", meetingId);
      } catch (err: any) {
        console.error("❌ Error inicializando MeetingRoom:", err);
        const errorMsg = err.message || "Error desconocido";
        setConnectionError(errorMsg);
        setIsConnecting(false);

        if (errorMsg.includes("No hay sesión") || errorMsg.includes("Token") || errorMsg.includes("autenticado")) {
          setTimeout(() => navigate("/login"), 3000);
        }
      }
    }

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveMeeting", { meetingId });
        socketRef.current.off("meeting:participants");
        socketRef.current.off("userJoined");
        socketRef.current.off("userLeft");
        socketRef.current.off("receiveMessage");
        socketRef.current.off("audio:stream");
        socketRef.current.off("video-offer");
        socketRef.current.off("video-answer");
        socketRef.current.off("ice-candidate");
        socketRef.current.off("meeting:error");
      }
      stopAudio();
      stopVideo();
    };
  }, [meetingId, user]);

  // Audio capture
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (isMuted) return;
        const audioData = e.inputBuffer.getChannelData(0);
        if (socketRef.current?.connected) {
          socketRef.current.emit("audio:stream", {
            meetingId,
            audioData: Array.from(audioData),
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

  const stopAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playReceivedAudio = async (audioData: number[]) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      }
      const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 16000);
      audioBuffer.getChannelData(0).set(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch {}
  };

  const toggleMute = () => setIsMuted(!isMuted);

  // Video capture and WebRTC
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Remote track
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      // ICE candidate
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", { meetingId, candidate: event.candidate });
        }
      };

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (socketRef.current) {
        socketRef.current.emit("video-offer", { meetingId, sdp: offer });
      }
    } catch (err) {
      console.error("❌ Video error:", err);
      alert("No se pudo iniciar la cámara. Verifica los permisos.");
    }
  };

  const handleVideoOffer = async (data: any) => {
    try {
      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", { meetingId, candidate: event.candidate });
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (socketRef.current) {
        socketRef.current.emit("video-answer", { meetingId, sdp: answer });
      }
    } catch (err) {
      console.error("❌ Video offer handling error:", err);
    }
  };

  const handleVideoAnswer = async (data: any) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }
    } catch (err) {
      console.error("❌ Video answer error:", err);
    }
  };

  const stopVideo = () => {
    if (localVideoRef.current?.srcObject) {
      (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // Send chat
  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { meetingId, text: input.trim() });
    setInput("");
  };

  // Hangup
  const handleHangup = () => {
    stopAudio();
    stopVideo();
    if (socketRef.current) socketRef.current.emit("leaveMeeting", { meetingId });
    navigate("/dashboard");
  };

  // Loading/error screens
  if (isConnecting) {
    return (
      <div className="meeting-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔄</div>
          <h2>Conectando a la reunión...</h2>
          <p style={{ color: "#666" }}>ID: {meetingId}</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="meeting-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "500px" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
          <h2>Error al conectar</h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>{connectionError}</p>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "0.75rem 1.5rem", background: "var(--teal)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1rem" }}>
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
          <span className="meeting-title">Reunión - ID: {meetingId ?? "----"}</span>
        </header>

        <div className="meeting-main">
          {/* Participants grid */}
          <section className="meeting-grid">
            {participants.map((participant) => (
              <article key={participant.uid} className="meeting-tile">
                <div className="meeting-avatar-circle">
                  <span>{(participant.name || participant.uid).slice(0, 1).toUpperCase()}</span>
                </div>
                <div className="meeting-participant-label">{participant.name || participant.uid}{participant.uid === user?.uid && " (Tú)"}</div>
              </article>
            ))}
            {Array.from({ length: Math.max(0, 6 - participants.length) }).map((_, idx) => (
              <article key={`placeholder-${idx}`} className="meeting-tile meeting-tile-empty">
                <div className="meeting-empty-icon">👥</div>
              </article>
            ))}
          </section>

          {/* Chat sidebar */}
          <aside className="meeting-sidebar">
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">Chat</button>
              <button className="meeting-tab">Participantes ({participants.length})</button>
            </div>

            <div className="meeting-chat-list">
              {messages.map((m, i) => (
                <div key={i} className="meeting-chat-message">
                  <div className="meeting-chat-meta">
                    <span className="meeting-chat-author">{m.userId}</span>
                    <span className="meeting-chat-time">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="meeting-chat-text">{m.text}</p>
                </div>
              ))}
            </div>

            <div className="meeting-chat-input-wrapper">
              <input type="text" className="meeting-chat-input" placeholder="Escribe un mensaje..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
              <button className="meeting-chat-send" onClick={handleSend}>➤</button>
            </div>
          </aside>
        </div>

        {/* Video section */}
        <div className="meeting-video-section">
          <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
        </div>

        {/* Toolbar */}
        <footer className="meeting-toolbar">
          <div className="meeting-toolbar-center">
            <button className={`meeting-control-btn ${isMuted ? "muted" : ""}`} onClick={toggleMute} title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}>
              {isMuted ? "🔇" : "🎙️"}
            </button>
            <button className="meeting-control-btn" onClick={mediaStreamRef.current ? stopAudio : startAudio} title={mediaStreamRef.current ? "Detener audio" : "Iniciar audio"}>
              {mediaStreamRef.current ? "⏹️" : "▶️"}
            </button>
            <button className="meeting-control-btn" onClick={startVideo} title="Iniciar video">📷</button>
            <button className="meeting-control-btn" title="Compartir pantalla">🖥️</button>
            <button className="meeting-control-btn" title={`${participants.length} participantes`}>👥 {participants.length}</button>
            <button className={`meeting-control-btn ${isConnected ? "connected" : "disconnected"}`} title={isConnected ? "Conectado" : "Desconectado"}>
              {isConnected ? "🟢" : "🔴"}
            </button>
            <button className="meeting-control-btn meeting-control-hangup" onClick={handleHangup} title="Salir de la reunión">✖</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
