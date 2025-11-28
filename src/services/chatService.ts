/**
 * Chat client service.
 * All text the user sees remains in Spanish.
 */

import { ChatMessage } from "../types/chat";
import { Socket } from "socket.io-client";

export const sendMessage = (socket: Socket | null, message: ChatMessage) => {
  if (!socket) return;
  socket.emit("chat:message", message);
};

export const subscribeToMessages = (
  socket: Socket | null,
  callback: (msg: ChatMessage) => void
) => {
  if (!socket) return;
  socket.on("chat:message", callback);
};
