/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/socket.ts
import { io as clientIO, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function initSocket(token?: string) {
  try {
    if (socket && socket.connected) return socket

    const url = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000'
    socket = clientIO(url, {
      auth: { token: token ? `Bearer ${token}` : (localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined) },
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('[socket] connected', socket?.id)
    })
    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err.message || err)
    })
    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason)
    })
    return socket
  } catch (e) {
    console.error('initSocket error', e)
    return null as any
  }
}

export function getSocket() { return socket }



// import { io, Socket } from 'socket.io-client'

// let socket: Socket | null = null

// export function initSocket(token?: string, _id?: any, role?: any) {
//   if (socket) return socket
//   socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
//     auth: { token },
//     transports: ['websocket'],
//   })
//   socket.on('connect', () => console.log('socket connected', socket?.id))
//   socket.on('connect_error', (err) => console.error('socket connect_error', err))
//   return socket
// }

// export function getSocket() { return socket }
// export function disconnectSocket() { socket?.disconnect(); socket = null }
