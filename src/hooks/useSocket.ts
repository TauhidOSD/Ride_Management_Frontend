// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react'
import { initSocket, getSocket } from '../lib/socket'
import type { Socket } from 'socket.io-client'

export function useSocket(token?: string, onConnect?: (s: Socket) => void) {
  const sockRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return
    const s = initSocket(token)
    sockRef.current = s
    if (onConnect && s) onConnect(s)

    return () => {
      
      s?.off('ride:new')
    
    }
  }, [token, onConnect])

  return { socket: sockRef.current ?? getSocket() }
}
