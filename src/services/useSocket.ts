/**
 * sockets.ts
 * 
 * Socket.IO client singleton service for Chat and Audio/Video.
 * 
 * Features:
 *  - Automatic token refresh for Firebase OAuth or manual JWT
 *  - Reconnection with retries
 *  - Supports both development (localhost) and production (Render/Vercel) URLs
 *  - Separate instances for chat and audio/video
 * 
 * Usage:
 *  import { getChatSocket, getAudioSocket } from './services/sockets';
 * 
 *  const chat = await getChatSocket();
 *  chat.emit('joinRoom', { roomId: 'ABC123' });
 * 
 *  const audio = await getAudioSocket();
 *  audio.emit('startCall', { meetingId: 'ABC123' });
 */

import { io, Socket } from "socket.io-client";
import { auth } from "../firebaseConfig";

// Singleton instances
let chatSocket: Socket | null = null;
let audioSocket: Socket | null = null;

/**
 * Retrieves authentication token (Firebase or localStorage)
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(true);
  }
  const storedToken = localStorage.getItem("accessToken");
  if (!storedToken) throw new Error("No hay sesión activa. Por favor inicia sesión nuevamente.");
  return storedToken;
}

/**
 * Creates a Socket.IO client instance
 */
async function createSocket(url: string): Promise<Socket> {
  const token = await getAuthToken();

  const socket = io(url, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Attach token for authentication
  socket.auth = { token };

  // Handlers
  socket.on("connect", () => {
    console.log(`✅ Socket conectado a ${url} exitosamente. ID:`, socket.id);
  });

  socket.on("connect_error", async (err: any) => {
    console.error(`❌ Error de conexión Socket a ${url}:`, err.message);
    if (err?.message?.includes("id-token-expired") || err?.message?.includes("No autorizado")) {
      try {
        const newToken = await getAuthToken();
        socket.auth = { token: newToken };
        socket.connect();
      } catch (refreshErr) {
        console.error("❌ Error al refrescar token:", refreshErr);
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn(`🔌 Socket desconectado de ${url}. Razón:`, reason);
  });

  // Connect with timeout
  if (!socket.connected) {
    socket.connect();
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout al conectar con ${url}. Verifica que el servicio esté corriendo.`));
      }, 10000);

      socket.once("connect", () => {
        clearTimeout(timeout);
        resolve();
      });

      socket.once("connect_error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  return socket;
}

/**
 * Returns singleton instance for Chat socket
 */
export async function getChatSocket(): Promise<Socket> {
  if (chatSocket && chatSocket.connected) return chatSocket;

  const url =
    import.meta.env.VITE_SOCKET_CHAT_URL ||
    (import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://servidorchatb.onrender.com");

  chatSocket = await createSocket(url);
  return chatSocket;
}

/**
 * Returns singleton instance for Audio/Video socket
 */
export async function getAudioSocket(): Promise<Socket> {
  if (audioSocket && audioSocket.connected) return audioSocket;

  const url =
    import.meta.env.VITE_SOCKET_AUDIO_URL ||
    (import.meta.env.MODE === "development" ? "http://localhost:5002" : "https://servidorvozb.onrender.com");

  audioSocket = await createSocket(url);
  return audioSocket;
}
