import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocket(token?: string) {
  if (socket) return socket
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  })
  socket.on('connect', () => console.log('socket connected', socket?.id))
  socket.on('connect_error', (err) => console.error('socket connect_error', err))
  return socket
}

export function getSocket() { return socket }
export function disconnectSocket() { socket?.disconnect(); socket = null }
