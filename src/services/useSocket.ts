/**
 * useSocket.ts
 *
 * Socket.IO client service (Chat & Audio/Video)
 *
 * Features:
 *  - Token authentication (Firebase or localStorage)
 *  - Auto reconnection and retry logic
 *  - Works for localhost and production environments
 *  - Two instances: chatSocket & audioSocket
 *  - Includes legacy getSocket() for backward compatibility
 */

import { io, Socket } from "socket.io-client";
import { auth } from "../firebaseConfig";

/* ============================================================
 * SINGLETON INSTANCES
 * ============================================================ */

let chatSocket: Socket | null = null;
let audioSocket: Socket | null = null;

/* ============================================================
 * TOKEN HANDLER
 * ============================================================ */

/**
 * Retrieves authentication token (Firebase or localStorage)
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;

  if (user) {
    return await user.getIdToken(true);
  }

  const storedToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (!storedToken) throw new Error("No hay sesión activa. Por favor inicia sesión nuevamente.");

  return storedToken;
}

/* ============================================================
 * SOCKET FACTORY
 * ============================================================ */

/**
 * Creates a new socket instance with authentication + reconnection
 */
async function createSocket(url?: string): Promise<Socket> {
  const token = await getAuthToken();

  const finalUrl =
    url ||
    import.meta.env.VITE_SOCKET_CHAT_URL ||
    (import.meta.env.MODE === "development"
      ? "http://localhost:5001"
      : "https://servidorchatb.onrender.com");

  const socket = io(finalUrl, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Attach token BEFORE connecting
  socket.auth = { token };

  /* ---------------------------
   * Event Handlers
   * --------------------------- */

  socket.on("connect", () => {
    console.log(`✅ Socket conectado: ${socket.id} → ${finalUrl}`);
  });

  socket.on("connect_error", async (err: any) => {
    console.error(`❌ Error conexión socket → ${finalUrl}:`, err.message);

    if (err.message?.includes("id-token-expired") || err.message?.includes("No autorizado")) {
      try {
        const refreshed = await getAuthToken();
        socket.auth = { token: refreshed };
        socket.connect();
      } catch (e) {
        console.error("❌ Error al refrescar token:", e);
      }
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn(`🔌 Socket desconectado (${finalUrl}):`, reason);
  });

  /* ---------------------------
   * Start connection with timeout
   * --------------------------- */
  socket.connect();

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`⏳ Timeout al conectar con ${finalUrl}. ¿Servidor caído?`));
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

  return socket;
}

/* ============================================================
 * CHAT SOCKET
 * ============================================================ */

export async function getChatSocket(): Promise<Socket> {
  if (chatSocket && chatSocket.connected) return chatSocket;

  const url =
    import.meta.env.VITE_SOCKET_CHAT_URL ||
    (import.meta.env.MODE === "development" ? "http://localhost:5001" : "https://servidorchatb.onrender.com");

  chatSocket = await createSocket(url);
  return chatSocket;
}

/* ============================================================
 * AUDIO SOCKET
 * ============================================================ */

export async function getAudioSocket(): Promise<Socket> {
  if (audioSocket && audioSocket.connected) return audioSocket;

  const url =
    import.meta.env.VITE_SOCKET_AUDIO_URL ||
    (import.meta.env.MODE === "development" ? "http://localhost:5002" : "https://servidorvozb.onrender.com");

  audioSocket = await createSocket(url);
  return audioSocket;
}

/* ============================================================
 * LEGACY EXPORT (Needed by MeetingRoom.tsx)
 * ============================================================ */

/**
 * getSocket()
 * 
 * LEGACY SUPPORT.
 * Some older pages still call getSocket(), so we keep it.
 * This returns the chat socket by default.
 */
export async function getSocket(): Promise<Socket> {
  return await getChatSocket();
}

/* ============================================================
 * DEFAULT MODERN HOOK-LIKE OBJECT
 * ============================================================ */

/**
 * Modern usage:
 *   const { socket, connect } = useSocket();
 */
export function useSocket() {
  return {
    socket: chatSocket,
    connect: async () => {
    chatSocket = await getChatSocket();
    return chatSocket;
    },
  };
}
