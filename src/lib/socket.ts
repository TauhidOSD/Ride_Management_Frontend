/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initSocket(token?: string, _id?: any, p0?: string) {
  try {
    const authToken = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!authToken) return null;

    if (socket && socket.connected) return socket;

    socket = io((import.meta.env.VITE_API_URL || "http://localhost:5173"), {
      auth: { token: authToken },
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect_error", (err) => console.error("Socket connect_error:", err && (err as any).message ? (err as any).message : err));
    return socket;
  } catch (e) {
    console.error("initSocket error", e);
    return socket;
  }
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
