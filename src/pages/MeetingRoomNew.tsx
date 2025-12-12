/**
 * MeetingRoom Component - Clean WebRTC Implementation
 */

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChatSocket } from "../services/useSocket";
import { useAuth } from "../context/AuthContext";

interface ChatMessage {
  userId: string;
  text: string;
  timestamp: number;
}

interface Participant {
  uid: string;
  name?: string;
  stream?: MediaStream;
}

export default function MeetingRoom() {
  const { id: meetingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Refs
  const socketRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const hasJoinedRef = useRef(false);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  };

  // ========== SOCKET CONNECTION ==========
  useEffect(() => {
    if (!meetingId || !user || hasJoinedRef.current) return;

    let socket: any;

    async function connect() {
      try {
        socket = await getChatSocket();
        socketRef.current = socket;
        hasJoinedRef.current = true;

        setupSocketListeners(socket);
        socket.emit("joinMeeting", { meetingId, userName: user.name || user.email });

        setIsConnected(true);
        setIsConnecting(false);

        // Auto request permissions
        requestPermissions();
      } catch (err: any) {
        console.error("❌ Connection error:", err);
        setConnectionError(err.message);
        setIsConnecting(false);
      }
    }

    connect();

    return () => {
      if (socket) {
        socket.emit("leaveMeeting", { meetingId });
        socket.off("meeting:participants");
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("receiveMessage");
        socket.off("video-offer");
        socket.off("video-answer");
        socket.off("ice-candidate");
      }
      cleanup();
    };
  }, [meetingId, user]);

  // ========== SOCKET LISTENERS ==========
  const setupSocketListeners = (socket: any) => {
    // Participants list
    socket.on("meeting:participants", (list: Participant[]) => {
      const others = list.filter(p => p.uid !== user?.uid);
      setParticipants(others);
    });

    // User joined
    socket.on("userJoined", ({ userId, userName }: any) => {
      if (userId === user?.uid) return;
      
      setParticipants(prev => {
        if (prev.some(p => p.uid === userId)) return prev;
        const newParticipant = { uid: userId, name: userName };
        
        // If we have video, create connection
        if (localStreamRef.current) {
          setTimeout(() => createPeerConnection(userId, true), 500);
        }
        
        return [...prev, newParticipant];
      });
    });

    // User left
    socket.on("userLeft", ({ userId }: any) => {
      setParticipants(prev => prev.filter(p => p.uid !== userId));
      
      const pc = peerConnectionsRef.current.get(userId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(userId);
      }
      remoteStreamsRef.current.delete(userId);
      forceUpdate();
    });

    // Chat messages
    socket.on("receiveMessage", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // WebRTC signaling
    socket.on("video-offer", handleVideoOffer);
    socket.on("video-answer", handleVideoAnswer);
    socket.on("ice-candidate", handleIceCandidate);
  };

  // ========== PERMISSIONS ==========
  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ Permissions granted");
    } catch (err) {
      console.warn("⚠️ Permissions denied:", err);
    }
  };

  // ========== VIDEO CONTROLS ==========
  const toggleVideo = async () => {
    if (isVideoOn) {
      stopVideo();
    } else {
      await startVideo();
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });

      localStreamRef.current = stream;
      setIsVideoOn(true);
      setIsScreenSharing(false);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connections for existing participants
      participants.forEach(p => createPeerConnection(p.uid, true));

    } catch (err) {
      console.error("❌ Video error:", err);
      alert("No se pudo acceder a la cámara");
    }
  };

  const stopVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();

    setIsVideoOn(false);
    setIsScreenSharing(false);
    forceUpdate();
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopVideo();
    } else {
      await startScreenShare();
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false
      });

      localStreamRef.current = stream;
      setIsScreenSharing(true);
      setIsVideoOn(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Auto stop when user clicks browser's stop button
      stream.getVideoTracks()[0].onended = () => {
        stopVideo();
      };

      // Create peer connections
      participants.forEach(p => createPeerConnection(p.uid, true));

    } catch (err) {
      console.error("❌ Screen share error:", err);
    }
  };

  // ========== WEBRTC PEER CONNECTIONS ==========
  const createPeerConnection = async (remoteUserId: string, shouldCreateOffer: boolean) => {
    if (!localStreamRef.current) return;
    if (peerConnectionsRef.current.has(remoteUserId)) return;

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionsRef.current.set(remoteUserId, pc);

    // Add local tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log("✅ Received remote track from", remoteUserId);
      if (event.streams[0]) {
        remoteStreamsRef.current.set(remoteUserId, event.streams[0]);
        
        // Update participant with stream
        setParticipants(prev => prev.map(p => 
          p.uid === remoteUserId ? { ...p, stream: event.streams[0] } : p
        ));
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

    // Connection state
    pc.onconnectionstatechange = () => {
      console.log(`Connection ${pc.connectionState} with ${remoteUserId}`);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        peerConnectionsRef.current.delete(remoteUserId);
        remoteStreamsRef.current.delete(remoteUserId);
        forceUpdate();
      }
    };

    // Create and send offer if we're the initiator
    if (shouldCreateOffer) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        socketRef.current?.emit("video-offer", {
          meetingId,
          sdp: offer,
          targetUserId: remoteUserId
        });
      } catch (err) {
        console.error("❌ Error creating offer:", err);
      }
    }
  };

  const handleVideoOffer = async (data: any) => {
    const { userId: remoteUserId, sdp } = data;
    if (remoteUserId === user?.uid) return;

    console.log("📥 Received offer from", remoteUserId);

    try {
      let pc = peerConnectionsRef.current.get(remoteUserId);
      
      if (!pc) {
        pc = new RTCPeerConnection(iceServers);
        peerConnectionsRef.current.set(remoteUserId, pc);

        // Add local tracks if we have them
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
            pc!.addTrack(track, localStreamRef.current!);
          });
        }

        // Handle incoming tracks
        pc.ontrack = (event) => {
          console.log("✅ Received remote track from", remoteUserId);
          if (event.streams[0]) {
            remoteStreamsRef.current.set(remoteUserId, event.streams[0]);
            setParticipants(prev => prev.map(p =>
              p.uid === remoteUserId ? { ...p, stream: event.streams[0] } : p
            ));
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
      }

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current?.emit("video-answer", {
        meetingId,
        sdp: answer,
        targetUserId: remoteUserId
      });

    } catch (err) {
      console.error("❌ Error handling offer:", err);
    }
  };

  const handleVideoAnswer = async (data: any) => {
    const { userId: remoteUserId, sdp } = data;
    if (remoteUserId === user?.uid) return;

    console.log("📥 Received answer from", remoteUserId);

    const pc = peerConnectionsRef.current.get(remoteUserId);
    if (pc && pc.signalingState !== 'stable') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (err) {
        console.error("❌ Error setting remote description:", err);
      }
    }
  };

  const handleIceCandidate = async (data: any) => {
    const { userId: remoteUserId, candidate } = data;
    if (remoteUserId === user?.uid) return;

    const pc = peerConnectionsRef.current.get(remoteUserId);
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("❌ ICE candidate error:", err);
      }
    }
  };

  // ========== CHAT ==========
  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { meetingId, text: input.trim() });
    setInput("");
  };

  const handleHangup = () => {
    cleanup();
    navigate("/dashboard");
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    peerConnectionsRef.current.forEach(pc => pc.close());
    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
  };

  // Force re-render
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger(prev => prev + 1);

  // ========== RENDER ==========
  if (isConnecting) {
    return (
      <div className="meeting-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <h2>🔄 Conectando...</h2>
          <p>ID: {meetingId}</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="meeting-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <h2>❌ Error</h2>
          <p>{connectionError}</p>
          <button onClick={() => navigate("/dashboard")}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-page">
      <div className="meeting-wrapper">
        <header className="meeting-topbar">
          <div className="meeting-status-dot" />
          <span className="meeting-title">Reunión - {meetingId}</span>
        </header>

        <div className="meeting-main">
          {/* Video Grid */}
          <section className="meeting-video-grid">
            {/* Local video */}
            {isVideoOn && (
              <div className="video-tile">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="video-element"
                />
                <div className="video-label">
                  {user?.name || user?.email} (Tú) {isScreenSharing && "🖥️"}
                </div>
              </div>
            )}

            {/* Remote videos */}
            {participants.map((participant) => {
              const stream = remoteStreamsRef.current.get(participant.uid);
              return (
                <div key={participant.uid} className="video-tile">
                  {stream ? (
                    <video
                      autoPlay
                      playsInline
                      className="video-element"
                      ref={el => {
                        if (el && el.srcObject !== stream) {
                          el.srcObject = stream;
                        }
                      }}
                    />
                  ) : (
                    <div className="video-placeholder">
                      <div className="avatar-circle">
                        {(participant.name || participant.uid).charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="video-label">{participant.name || participant.uid}</div>
                </div>
              );
            })}

            {/* Empty placeholders */}
            {!isVideoOn && participants.length === 0 && (
              <div className="video-tile video-empty">
                <div className="empty-state">
                  <p>📹 Inicia tu cámara para comenzar</p>
                </div>
              </div>
            )}
          </section>

          {/* Chat sidebar */}
          <aside className="meeting-sidebar">
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">
                Chat
              </button>
              <button className="meeting-tab">
                Participantes ({participants.length + 1})
              </button>
            </div>

            <div className="meeting-chat-list">
              {messages.map((msg, i) => (
                <div key={i} className="meeting-chat-message">
                  <div className="meeting-chat-meta">
                    <span className="meeting-chat-author">{msg.userId}</span>
                    <span className="meeting-chat-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="meeting-chat-text">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="meeting-chat-input-wrapper">
              <input
                type="text"
                className="meeting-chat-input"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="meeting-chat-send" onClick={sendMessage}>
                ➤
              </button>
            </div>
          </aside>
        </div>

        {/* Toolbar */}
        <footer className="meeting-toolbar">
          <div className="meeting-toolbar-center">
            <button
              className={`meeting-control-btn ${isMuted ? "muted" : ""}`}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Activar micrófono" : "Silenciar"}
            >
              {isMuted ? "🔇" : "🎙️"}
            </button>

            <button
              className={`meeting-control-btn ${isVideoOn && !isScreenSharing ? "active" : ""}`}
              onClick={toggleVideo}
              title={isVideoOn ? "Detener cámara" : "Iniciar cámara"}
            >
              {isVideoOn && !isScreenSharing ? "📹" : "📷"}
            </button>

            <button
              className={`meeting-control-btn ${isScreenSharing ? "active" : ""}`}
              onClick={toggleScreenShare}
              title={isScreenSharing ? "Detener compartir" : "Compartir pantalla"}
            >
              {isScreenSharing ? "🟥" : "🖥️"}
            </button>

            <button className="meeting-control-btn">
              👥 {participants.length + 1}
            </button>

            <button
              className={`meeting-control-btn ${isConnected ? "connected" : ""}`}
              title={isConnected ? "Conectado" : "Desconectado"}
            >
              {isConnected ? "🟢" : "🔴"}
            </button>

            <button
              className="meeting-control-btn meeting-control-hangup"
              onClick={handleHangup}
              title="Salir"
            >
              ✖
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
