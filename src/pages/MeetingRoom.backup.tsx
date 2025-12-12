/**
 * MeetingRoom Component
 * Main meeting interface with real-time chat, audio/video streaming
 * Handles Socket.IO connection, participant management, Web Audio API and WebRTC
 */

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChatSocket } from "../services/useSocket";
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
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const lastMessageIdRef = useRef<string>("");

  const socketRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const hasJoinedRef = useRef(false);

  // ICE servers configuration - Two STUN servers for redundancy (Sprint 4 requirement)
  const iceServers = { 
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ] 
  };

  // Connect to socket and join meeting ONCE
  useEffect(() => {
    if (!meetingId || !user || hasJoinedRef.current) return;

    async function connect() {
      setIsConnecting(true);
      setConnectionError(null);

      try {
        const socket = await getChatSocket();
        socketRef.current = socket;
        hasJoinedRef.current = true;

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

        // Initial participants list (excludes current user)
        socket.on("meeting:participants", (list: Participant[]) => {
          // Remove current user and duplicates
          const uniqueParticipants = list.filter(
            (p, index, self) => 
              p.uid !== user?.uid && // Don't include myself
              index === self.findIndex((t) => t.uid === p.uid) // Remove duplicates
          );
          setParticipants(uniqueParticipants);
        });

        // Participant joined (don't add if it's me or already exists)
        socket.on("userJoined", ({ userId, userName }: { userId: string; userName?: string }) => {
          // Don't add myself or duplicates
          if (userId === user?.uid) return;
          
          setParticipants((prev) => {
            if (prev.some((p) => p.uid === userId)) return prev;
            const newList = [...prev, { uid: userId, name: userName }];
            
            // If video is active, create peer connection for new participant
            if (localStreamRef.current) {
              createPeerConnection(userId, localStreamRef.current, true);
            }
            
            return newList;
          });
        });

        // Participant left
        socket.on("userLeft", ({ userId }: { userId: string }) => {
          setParticipants((prev) => prev.filter((p) => p.uid !== userId));
          
          // Clean up peer connection and stream
          const pc = peerConnectionsRef.current.get(userId);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(userId);
          }
          
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
        });

        // Receive chat messages (prevent duplicates)
        socket.on("receiveMessage", (msg: ChatMessage) => {
          const msgId = `${msg.userId}-${msg.timestamp}-${msg.text}`;
          if (msgId === lastMessageIdRef.current) return; // Skip duplicate
          
          lastMessageIdRef.current = msgId;
          setMessages((prev) => [...prev, msg]);
        });

        // Audio stream from others
        socket.on("audio:stream", async ({ audioData }: { audioData: number[] }) => {
          await playReceivedAudio(audioData);
        });

        // WebRTC video signaling - properly handle peer-to-peer connections
        socket.on("video-offer", async (data: any) => {
          // Don't process offers from myself
          if (data.userId === user?.uid) return;
          await handleVideoOffer(data);
        });
        
        socket.on("video-answer", async (data: any) => {
          // Don't process answers from myself
          if (data.userId === user?.uid) return;
          await handleVideoAnswer(data);
        });
        
        socket.on("ice-candidate", async (data: any) => {
          // Don't process ICE candidates from myself
          if (data.userId === user?.uid) return;
          
          const pc = peerConnectionsRef.current.get(data.userId);
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
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

        // Auto request camera/mic permissions on join
        requestMediaPermissions();
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
  const toggleAudio = async () => {
    if (isAudioActive) {
      stopAudio();
    } else {
      await startAudio();
    }
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      mediaStreamRef.current = stream;
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      setIsAudioActive(true);

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
    setIsAudioActive(false);
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

  // Request media permissions on join
  const requestMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ Permisos de cámara/micrófono concedidos");
    } catch (err) {
      console.warn("⚠️ Permisos denegados:", err);
    }
  };

  // Video capture and WebRTC - Improved multi-peer support
  const startVideo = async () => {
    if (isVideoActive) {
      stopVideo();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: false 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsVideoActive(true);

      // Create peer connections with all existing participants
      participants.forEach((participant) => {
        if (participant.uid !== user?.uid) {
          createPeerConnection(participant.uid, stream, true);
        }
      });
    } catch (err) {
      console.error("❌ Video error:", err);
      alert("No se pudo iniciar la cámara. Verifica los permisos.");
    }
  };

  const createPeerConnection = async (remoteUserId: string, stream: MediaStream, shouldOffer: boolean) => {
    if (peerConnectionsRef.current.has(remoteUserId)) return;

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionsRef.current.set(remoteUserId, pc);

    // Add local tracks
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Handle remote tracks
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(remoteUserId, event.streams[0]);
          return newMap;
        });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", { 
          meetingId, 
          candidate: event.candidate,
          targetUserId: remoteUserId 
        });
      }
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log(`Connection ${pc.connectionState} with ${remoteUserId}`);
        peerConnectionsRef.current.delete(remoteUserId);
      }
    };

    // Create offer if initiator
    if (shouldOffer) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        if (socketRef.current) {
          socketRef.current.emit("video-offer", { 
            meetingId, 
            sdp: offer,
            targetUserId: remoteUserId 
          });
        }
      } catch (err) {
        console.error("❌ Error creating offer:", err);
      }
    }
  };

  const handleVideoOffer = async (data: any) => {
    try {
      const { userId: remoteUserId, sdp } = data;
      
      // Get or create local stream
      let stream = localStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: false 
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection(iceServers);
      peerConnectionsRef.current.set(remoteUserId, pc);

      // Add local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (event.streams[0]) {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(remoteUserId, event.streams[0]);
            return newMap;
          });
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", { 
            meetingId, 
            candidate: event.candidate,
            targetUserId: remoteUserId 
          });
        }
      };

      // Set remote description and create answer
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      if (socketRef.current) {
        socketRef.current.emit("video-answer", { 
          meetingId, 
          sdp: answer,
          targetUserId: remoteUserId 
        });
      }
    } catch (err) {
      console.error("❌ Video offer handling error:", err);
    }
  };

  const handleVideoAnswer = async (data: any) => {
    try {
      const { userId: remoteUserId, sdp } = data;
      const pc = peerConnectionsRef.current.get(remoteUserId);
      
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    } catch (err) {
      console.error("❌ Video answer error:", err);
    }
  };

  const stopVideo = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsVideoActive(false);
    setIsScreenSharing(false);
    setRemoteStreams(new Map());

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
  };

  // Share screen functionality
  const shareScreen = async () => {
    if (isScreenSharing) {
      stopVideo();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" }, 
        audio: false 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsScreenSharing(true);
      setIsVideoActive(true);

      // Handle when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopVideo();
      };

      // Create peer connections with all existing participants
      participants.forEach((participant) => {
        if (participant.uid !== user?.uid) {
          createPeerConnection(participant.uid, stream, true);
        }
      });
    } catch (err) {
      console.error("❌ Screen share error:", err);
      alert("No se pudo compartir la pantalla.");
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
          {/* Video Grid */}
          <section className="meeting-grid">
            {/* Local video (self) */}
            {isVideoActive && (
              <article key={user?.uid || 'local'} className="meeting-tile meeting-tile--video">
                <video ref={localVideoRef} autoPlay muted playsInline className="participant-video" />
                <div className="meeting-participant-label">
                  {user?.name || user?.email || 'Tú'} (Tú)
                </div>
              </article>
            )}

            {/* Remote participants videos */}
            {participants.map((participant) => {
              const stream = remoteStreams.get(participant.uid);
              return (
                <article key={participant.uid} className={`meeting-tile ${stream ? 'meeting-tile--video' : ''}`}>
                  {stream ? (
                    <video 
                      autoPlay 
                      playsInline 
                      className="participant-video"
                      ref={(el) => {
                        if (el) el.srcObject = stream;
                      }}
                    />
                  ) : (
                    <div className="meeting-avatar-circle">
                      <span>{(participant.name || participant.uid).slice(0, 1).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="meeting-participant-label">{participant.name || participant.uid}</div>
                </article>
              );
            })}

            {/* Empty placeholders */}
            {Array.from({ length: Math.max(0, 6 - participants.length - (isVideoActive ? 1 : 0)) }).map((_, idx) => (
              <article key={`placeholder-${idx}`} className="meeting-tile meeting-tile-empty">
                <div className="meeting-empty-icon">👥</div>
              </article>
            ))}
          </section>

          {/* Chat sidebar */}
          <aside className="meeting-sidebar">
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">Chat</button>
              <button className="meeting-tab">Participantes ({participants.length + 1})</button>
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

        {/* Toolbar */}
        <footer className="meeting-toolbar">
          <div className="meeting-toolbar-center">
            <button 
              className={`meeting-control-btn ${isMuted ? "muted" : ""}`} 
              onClick={toggleMute} 
              title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
              disabled={!isAudioActive}
            >
              {isMuted ? "🔇" : "🎙️"}
            </button>
            <button 
              className={`meeting-control-btn ${isAudioActive ? "active" : ""}`}
              onClick={toggleAudio} 
              title={isAudioActive ? "Detener audio" : "Iniciar audio"}
            >
              {isAudioActive ? "⏹️" : "▶️"}
            </button>
            <button 
              className={`meeting-control-btn ${isVideoActive && !isScreenSharing ? "active" : ""}`} 
              onClick={startVideo} 
              title={isVideoActive ? "Detener video" : "Iniciar video"}
            >
              {isVideoActive && !isScreenSharing ? "📹" : "📷"}
            </button>
            <button 
              className={`meeting-control-btn ${isScreenSharing ? "active" : ""}`} 
              onClick={shareScreen}
              title={isScreenSharing ? "Detener compartir" : "Compartir pantalla"}
            >
              {isScreenSharing ? "🟥" : "🖥️"}
            </button>
            <button className="meeting-control-btn" title={`${participants.length + 1} participantes (incluyéndote)`}>
              👥 {participants.length + 1}
            </button>
            <button 
              className={`meeting-control-btn ${isConnected ? "connected" : "disconnected"}`} 
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
