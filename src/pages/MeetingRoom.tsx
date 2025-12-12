/**
 * MeetingRoom Component - Copied from working EJEMPLO
 */

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SimplePeer from "simple-peer";
import { getChatSocket } from "../services/useSocket";
import { useAuth } from "../context/AuthContext";
import "./MeetingRoom.css";

interface Peer {
  peerId: string;
  peer: SimplePeer.Instance;
  stream?: MediaStream;
}

interface ChatMessage {
  userId: string;
  text: string;
  timestamp: number;
}

export default function MeetingRoom() {
  const { id: meetingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [fitContain, setFitContain] = useState(false);


  // Refs
  const socketRef = useRef<any>(null);
  const peersRef = useRef<Peer[]>([]);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const hasConnected = useRef(false);

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (!meetingId || !user || hasConnected.current) {
      if (!user) navigate("/login");
      return;
    }

    hasConnected.current = true;

    async function init() {
      try {
        // Get local media
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Connect to socket
        const socket = await getChatSocket();
        socketRef.current = socket;

        // Join meeting
        socket.emit("joinMeeting", { meetingId, userName: user.name || user.email });

        // ========== SOCKET LISTENERS ==========
        
        // Introduction - receive list of existing socket IDs (don't create peers - they will)
        socket.on("meeting:participants", (otherSocketIds: string[]) => {
          console.log('Introduction received. Existing users:', otherSocketIds);
          // Don't create peers here - existing users will create peers to us
        });

        // New user joined - ONLY existing users create peer to new user
        socket.on("userJoined", ({ socketId }: any) => {
          console.log('New user connected:', socketId, 'My ID:', socket.id);
          // Only create peer if it's NOT me and doesn't already exist
          if (socketId && socketId !== socket.id) {
            const existingPeer = peersRef.current.find((p) => p.peerId === socketId);
            if (!existingPeer) {
              console.log('Creating peer for new user:', socketId);
              createPeer(socketId, socket.id!, stream, socket);
            } else {
              console.log('Peer already exists for:', socketId);
            }
          }
        });

        // Signal handling
        socket.on("signal", (to: string, from: string, data: any) => {
          console.log('Received signal from:', from, 'To:', to, 'Type:', data.type);
          
          // If signal is directed to my screen ID, create a separate peer for screen
          if (to.endsWith('-screen') && to.startsWith(socket.id || '')) {
            const screenPeerId = `${from}-to-my-screen`;
            const existingScreenPeer = peersRef.current.find((p) => p.peerId === screenPeerId);
            
            if (existingScreenPeer && !existingScreenPeer.peer.destroyed) {
              console.log('Signaling existing screen peer:', screenPeerId);
              existingScreenPeer.peer.signal(data);
            } else {
              console.log('Creating screen peer:', screenPeerId, 'ReplyFrom:', to, 'ReplyTo:', from);
              // Use screenStreamRef if available, otherwise fallback to camera stream
              const streamToUse = screenStreamRef.current || stream;
              console.log('Using stream for screen peer:', screenStreamRef.current ? 'screenStream' : 'camera stream');
              // Reply FROM my screen ID TO the sender's peer
              addPeer(data, screenPeerId, streamToUse, socket, to, from);
            }
            return;
          }
          
          // Normal camera peer handling
          const peer = peersRef.current.find((p) => p.peerId === from);
          if (peer) {
            // Only signal if peer is not destroyed
            if (!peer.peer.destroyed) {
              peer.peer.signal(data);
            }
          } else {
            console.log('Creating new peer for signal from:', from);
            addPeer(data, from, stream, socket);
          }
        });

        // User disconnected
        socket.on("userLeft", ({ socketId }: any) => {
          console.log('User disconnected:', socketId);
          const peerObj = peersRef.current.find((p) => p.peerId === socketId);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          peersRef.current = peersRef.current.filter((p) => p.peerId !== socketId);
          setPeers([...peersRef.current]);
        });

        // Screen share started
        socket.on("startScreenShare", ({ socketId }: any) => {
          console.log('User started screen sharing. Base socketId:', socketId);
          // Create a peer to receive their screen with -screen suffix
          const screenPeerId = `${socketId}-screen`;
          const existingPeer = peersRef.current.find((p) => p.peerId === screenPeerId);
          if (!existingPeer) {
            console.log('Creating peer to receive screen from:', screenPeerId);
            createPeer(screenPeerId, socket.id!, stream, socket);
          }
        });

        // Screen share stopped
        socket.on("stopScreenShare", ({ socketId }: any) => {
          console.log('User stopped screen sharing:', socketId);
          const baseId = socketId.replace('-screen', '');
          const screenPeers = peersRef.current.filter((p) => p.peerId === `${baseId}-screen`);
          screenPeers.forEach((peerObj) => peerObj.peer.destroy());
          peersRef.current = peersRef.current.filter((p) => p.peerId !== `${baseId}-screen`);
          setPeers([...peersRef.current]);
        });

        // Chat messages
        socket.on("receiveMessage", (msg: ChatMessage) => {
          setMessages(prev => [...prev, msg]);
        });

      } catch (err: any) {
        console.error("❌ Init error:", err);
        alert("No se pudo acceder a cámara/micrófono");
      }
    }

    init();

    return () => {
      cleanup();
    };
  }, [meetingId, user, navigate]);

  // Effect to connect screen stream to video element
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // ========== PEER FUNCTIONS ==========
  
  const createPeer = (userToSignal: string, callerId: string, stream: MediaStream, socket: any) => {
    console.log('Creating peer (initiator) for:', userToSignal);
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      console.log('Sending signal to:', userToSignal);
      socket.emit('signal', userToSignal, callerId, signal);
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream from:', userToSignal);
      const peerObj = peersRef.current.find(p => p.peerId === userToSignal);
      if (peerObj) {
        peerObj.stream = remoteStream;
        setPeers([...peersRef.current]);
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error (initiator):', err);
    });

    const peerObj: Peer = { peerId: userToSignal, peer };
    peersRef.current.push(peerObj);
    setPeers([...peersRef.current]);
  };

  const addPeer = (incomingSignal: any, callerId: string, stream: MediaStream, socket: any, replyFromId?: string, replyToId?: string) => {
    const fromId = replyFromId || socket.id!;
    const toId = replyToId || callerId;
    console.log('Adding peer (receiver) with ID:', callerId, 'Will reply from:', fromId, 'to:', toId);
    
    // If we're replying from a screen ID, use screenStream instead
    const isScreenReply = fromId.endsWith('-screen');
    const streamToSend = isScreenReply && screenStream 
      ? screenStream
      : stream;
    
    console.log('Using stream:', isScreenReply ? 'screen' : 'camera');
    
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: streamToSend,
    });

    peer.on('signal', (signal) => {
      console.log('Sending signal to:', toId, 'from:', fromId);
      socket.emit('signal', toId, fromId, signal);
    });

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream from:', callerId);
      const peerObj = peersRef.current.find(p => p.peerId === callerId);
      if (peerObj) {
        peerObj.stream = remoteStream;
        setPeers([...peersRef.current]);
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error (receiver):', err);
    });

    peer.signal(incomingSignal);

    const peerObj: Peer = { peerId: callerId, peer };
    peersRef.current.push(peerObj);
    setPeers([...peersRef.current]);
  };

  // ========== CONTROLS ==========
  
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = async () => {
    if (!localStream) return;

    // Peers de cámara (no toques peers de pantalla)
    const cameraPeers = peersRef.current.filter(
      (p) => !p.peerId.includes("-screen") && !p.peerId.includes("-to-my-screen")
    );

    // ===== APAGAR (real) =====
    if (!isVideoOff) {
      const currentTrack = localStream.getVideoTracks()[0];
      if (!currentTrack) {
        setIsVideoOff(true);
        return;
      }

      // 1) Dejar de enviar el track a TODOS los peers (renegocia)
      cameraPeers.forEach(({ peer }) => {
        try {
          peer.removeTrack(currentTrack, localStream);
        } catch (e) {
          console.warn("removeTrack fallo:", e);
        }
      });

      // 2) Detener físicamente la cámara (libera el dispositivo)
      currentTrack.stop();
      localStream.removeTrack(currentTrack);

      // 3) Refrescar el video local (queda negro o solo audio)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      setIsVideoOff(true);
      return;
    }

    // ===== ENCENDER =====
    try {
      // Pedimos un NUEVO track (porque el anterior se detuvo con stop())
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const newTrack = cam.getVideoTracks()[0];
      if (!newTrack) return;

      // Por si acaso: evitar duplicados
      const existing = localStream.getVideoTracks()[0];
      if (existing) {
        existing.stop();
        localStream.removeTrack(existing);
      }

      // 1) Agregar track al stream local
      localStream.addTrack(newTrack);

      // 2) Reponer video local
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play?.().catch(() => {});
      }

      // 3) Volver a enviar el track a peers (renegocia)
      cameraPeers.forEach(({ peer }) => {
        try {
          peer.addTrack(newTrack, localStream);
        } catch (e) {
          console.warn("addTrack fallo:", e);
        }
      });

      setIsVideoOff(false);
    } catch (err) {
      console.error("No se pudo reactivar la cámara:", err);
      alert("No se pudo reactivar la cámara. Revisa permisos del navegador.");
    }
  };

  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      // Detener compartir pantalla
      screenStream?.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      screenStreamRef.current = null;
      
      // Destruir peers de pantalla compartida
      const screenPeers = peersRef.current.filter((p) => p.peerId.includes('-screen'));
      screenPeers.forEach((peerObj) => {
        peerObj.peer.destroy();
      });
      peersRef.current = peersRef.current.filter((p) => !p.peerId.includes('-screen'));
      setPeers([...peersRef.current]);
      
      // Notificar a otros usuarios
      if (socketRef.current) {
        socketRef.current.emit('stopScreenShare', { meetingId, userId: user?.uid });
      }
      
      setIsSharingScreen(false);
    } else {
      // Iniciar compartir pantalla
      try {
        const newScreenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false 
        });
        
        // Detener cuando el usuario pare desde el navegador
        newScreenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
        
        setScreenStream(newScreenStream);
        screenStreamRef.current = newScreenStream;
        
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = newScreenStream;
        }
        
        setIsSharingScreen(true);
        
        // Notificar a otros usuarios - ELLOS crearán peers hacia mi socketId-screen
        if (socketRef.current) {
          console.log('Notifying others about screen share. My base socketId:', socketRef.current.id);
          // Send base socketId (backend will use socket.id anyway)
          socketRef.current.emit('startScreenShare', { meetingId, userId: user?.uid });
        }
      } catch (error) {
        console.error('Error al compartir pantalla:', error);
        alert('No se pudo compartir la pantalla');
      }
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { meetingId, text: input.trim() });
    setInput("");
  };

  const cleanup = () => {
    localStream?.getTracks().forEach(track => track.stop());
    screenStream?.getTracks().forEach(track => track.stop());
    peersRef.current.forEach(peerObj => peerObj.peer.destroy());
    
    if (socketRef.current) {
      socketRef.current.emit("leaveMeeting", { meetingId });
      socketRef.current.off("meeting:participants");
      socketRef.current.off("userJoined");
      socketRef.current.off("userLeft");
      socketRef.current.off("receiveMessage");
      socketRef.current.off("signal");
      socketRef.current.off("startScreenShare");
      socketRef.current.off("stopScreenShare");
    }
  };

  // ========== RENDER ==========
  
  return (
    <div className="meeting-page">
      <div className="meeting-container">
        <header className="meeting-header">
          <div className="meeting-header-left">
            <h1 className="meeting-title">Reunión {meetingId}</h1>
            <p className="meeting-subtitle">{user?.name || user?.email}</p>
          </div>
        </header>

        <div className="meeting-main">
          {/* Participants grid */}
          <section className="meeting-grid">
            {/* Local Video */}
            <article className={`meeting-tile meeting-tile-video local ${fitContain ? "fit-contain" : ""}`}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="meeting-video"
              />
              <div className="meeting-video-label">
                Tú {isVideoOff && '(Video desactivado)'}
              </div>
            </article>

            {/* Local Screen Share */}
            {screenStream && (
              <article className="meeting-tile meeting-tile-video">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="meeting-video"
                />
                <div className="meeting-video-label" style={{backgroundColor: 'var(--teal)'}}>
                  Tu pantalla compartida
                </div>
              </article>
            )}

            {/* Remote Videos */}
            {peers
              .filter((peerObj) => !peerObj.peerId.includes('-to-my-screen'))
              .map((peerObj) => (
                <RemoteVideo key={peerObj.peerId} peer={peerObj.peer} peerId={peerObj.peerId} stream={peerObj.stream} />
              ))}
            
            {/* Empty placeholders */}
            {Array.from({ length: Math.max(0, 6 - peers.filter(p => !p.peerId.includes('-to-my-screen')).length - (screenStream ? 2 : 1)) }).map((_, idx) => (
              <article key={`placeholder-${idx}`} className="meeting-tile meeting-tile-empty">
                <div className="meeting-empty-icon">👤</div>
              </article>
            ))}
          </section>

          {/* Chat sidebar */}
          <aside className="meeting-sidebar">
            <div className="meeting-tabs">
              <button className="meeting-tab meeting-tab--active">Chat</button>
              <button className="meeting-tab">Participantes ({peers.filter(p => !p.peerId.includes('-screen')).length + 1})</button>
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
              <input 
                type="text" 
                className="meeting-chat-input" 
                placeholder="Escribe un mensaje..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
              />
              <button className="meeting-chat-send" onClick={sendMessage}>✈️</button>
            </div>
          </aside>
        </div>

        {/* Toolbar */}
        <footer className="meeting-toolbar">
          <div className="meeting-toolbar-center">
            <button 
              className={`meeting-control-btn ${isMuted ? "muted" : ""}`} 
              onClick={toggleAudio} 
              title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
            >
              {isMuted ? "🔇" : "🎤"}
            </button>
            
            <button
              className="meeting-control-btn"
              onClick={() => setFitContain(v => !v)}
              title={fitContain ? "Llenar (recorta)" : "Ajustar (no recorta)"}
            >
              {fitContain ? "⤢" : "⤡"}
            </button>


            <button 
              className={`meeting-control-btn ${isVideoOff ? "muted" : ""}`} 
              onClick={toggleVideo} 
              title={isVideoOff ? "Activar video" : "Apagar video"}
            >
              {isVideoOff ? "📹" : "📹"}
            </button>
            
            <button 
              className={`meeting-control-btn ${isSharingScreen ? "active" : ""}`} 
              onClick={toggleScreenShare} 
              title={isSharingScreen ? "Detener compartir" : "Compartir pantalla"}
            >
              🖥️
            </button>
            
            <button 
              className="meeting-control-btn" 
              title={`${peers.filter(p => !p.peerId.includes('-screen')).length + 1} participantes`}
            >
              👤 {peers.filter(p => !p.peerId.includes('-screen')).length + 1}
            </button>
            
            <button 
              className="meeting-control-btn meeting-control-hangup" 
              onClick={() => {
                cleanup();
                navigate("/dashboard");
              }} 
              title="Salir de la reunión"
            >
              ☎️
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ========== REMOTE VIDEO COMPONENT ==========

interface RemoteVideoProps {
  peer: SimplePeer.Instance;
  peerId: string;
  stream?: MediaStream;
}

const RemoteVideo: React.FC<RemoteVideoProps> = ({ peer, peerId, stream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isScreenShare = peerId.endsWith('-screen');
  const displayId = isScreenShare ? peerId.replace('-screen', '').substring(0, 6) : peerId.substring(0, 6);
  const label = isScreenShare ? `Usuario ${displayId} - Pantalla Compartida` : `Usuario ${displayId}`;

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <article className="meeting-tile meeting-tile-video">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="meeting-video"
      />
      <div className="meeting-video-label" style={isScreenShare ? {backgroundColor: 'var(--teal)'} : {}}>
        {label}
      </div>
    </article>
  );
};
