/**
 * useSocket.ts
 * React Hook for connecting the client to the chat websocket server.
 */

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ENV } from "../config/env";

export const useSocket = (roomId: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(ENV.CHAT_SERVER_URL, {
      query: { roomId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Connected to chat server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from chat server");
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return socketRef.current;
};
