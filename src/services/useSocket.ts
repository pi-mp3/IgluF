/**
 * Socket.IO client singleton service
 * Manages WebSocket connection to chat server with automatic token refresh
 * Supports both Firebase ID tokens (OAuth) and JWT tokens (manual login)
 */

import { io, Socket } from "socket.io-client";
import { auth } from "../firebaseConfig";

/** Singleton socket instance shared across the application */
let socket: Socket | null = null;

/**
 * Gets or creates the Socket.IO client instance with authentication
 * Implements singleton pattern to reuse existing connection
 * Automatically retrieves token from Firebase Auth or localStorage
 * 
 * @returns {Promise<Socket>} Connected Socket.IO client instance
 * @throws {Error} If no valid authentication token is available
 * 
 * @example
 * const socket = await getSocket();
 * socket.emit('joinMeeting', { meetingId: 'ABC123' });
 */
export async function getSocket() {
  // Reuse existing connection if available
  if (socket && socket.connected) {
    return socket;
  }

  let token: string;
  
  // Try Firebase Auth first (OAuth users)
  const user = auth.currentUser;
  
  if (user) {
    token = await user.getIdToken(true);
  } else {
    // Fallback to localStorage (manual login users)
    const storedToken = localStorage.getItem("accessToken");
    
    if (!storedToken) {
      throw new Error("No hay sesión activa. Por favor inicia sesión nuevamente.");
    }
    
    token = storedToken;
  }

  // Create socket instance if it doesn't exist
  if (!socket) {
    socket = io("http://localhost:5001", {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    /**
     * Connection success handler
     * Logs successful connection for debugging
     */
    socket.on("connect", () => {
      console.log("✅ Socket conectado exitosamente. ID:", socket?.id);
    });

    /**
     * Connection error handler
     * Attempts to refresh expired tokens automatically
     */
    socket.on("connect_error", async (err: any) => {
      console.error("❌ Error de conexión Socket:", err.message);

      // Auto-refresh expired Firebase tokens
      if (err?.message?.includes("id-token-expired") || err?.message?.includes("No autorizado")) {
        try {
          const newToken = await user.getIdToken(true);
          socket!.auth = { token: newToken };
          socket!.connect();
        } catch (refreshErr) {
          console.error("❌ Error al refrescar token:", refreshErr);
        }
      }
    });

    /**
     * Disconnection handler
     * Logs disconnect reason for debugging
     */
    socket.on("disconnect", (reason) => {
      console.warn("🔌 Socket desconectado. Razón:", reason);
    });
  }

  // Attach authentication token to socket
  socket.auth = { token };

  // Connect if not already connected
  if (!socket.connected) {
    socket.connect();
    
    /**
     * Wait for connection to establish with timeout
     * Prevents indefinite hanging if server is unreachable
     */
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Timeout al conectar con el servidor. Verifica que ServidorChatB esté corriendo en puerto 5001."));
      }, 10000);

      socket!.once("connect", () => {
        clearTimeout(timeout);
        resolve();
      });

      socket!.once("connect_error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  return socket;
}