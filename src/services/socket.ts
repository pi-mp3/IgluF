// src/services/socket.ts
import { io, Socket } from "socket.io-client";
import { auth } from "../firebaseConfig";

let socket: Socket | null = null;

export async function getSocket() {
  // Si ya existe y está conectado → úsalo
  if (socket && socket.connected) return socket;

  // Asegurar usuario autenticado
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado");

  // 🔥 REFRESCAR TOKEN SIEMPRE
  const token = await user.getIdToken(true); // <-- fuerza refresh

  // Crear instancia si no existe
  if (!socket) {
    socket = io("http://localhost:5001", {
      autoConnect: false,
      transports: ["websocket"],
    });

    // LOGS
    socket.on("connect", () => {
      console.log("✅ Socket conectado:", socket?.id);
    });

    socket.on("connect_error", async (err: any) => {
      console.error("❌ Error de conexión Socket:", err.message);

      // Si token expiró → refrescar y reconectar
      if (err?.message?.includes("id-token-expired")) {
        console.warn("🔄 Token expirado. Intentando refrescar...");

        const newToken = await user.getIdToken(true);
        socket!.auth = { token: newToken };

        socket!.connect();
      }
    });
  }

  // Asignar auth con token nuevo antes de conectar
  socket.auth = { token };

  // Conectar
  socket.connect();

  return socket;
}
