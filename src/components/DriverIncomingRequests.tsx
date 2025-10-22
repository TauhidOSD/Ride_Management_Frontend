/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DriverIncomingRequests.tsx
import React, { useEffect, useState } from 'react'
import { initSocket } from '../lib/socket'
import { useAcceptRideMutation } from '../api/baseApi' // if you added mutation
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

type IncomingRide = { rideId?: string; pickup?: any; destination?: any; fare?: number }

export default function DriverIncomingRequests() {
  const [requests, setRequests] = useState<IncomingRide[]>([])
  const token = useSelector((s: RootState) => (s as any).auth?.token)
  const [acceptRide] = useAcceptRideMutation()

  useEffect(() => {
    const s = initSocket(token)
    const onNew = (data: IncomingRide) => setRequests(prev => [data, ...prev])
    s.on('ride:new', onNew)
    s.on('ride:updated', (payload) => {
      // remove accepted ride from requests if status updated
      if (payload?.status === 'accepted') {
        setRequests(prev => prev.filter(r => r.rideId !== payload.rideId))
      }
    })
    return () => {
      s.off('ride:new', onNew)
      s.off('ride:updated')
    }
  }, [token])

  const handleAccept = async (rideId?: string) => {
    const s = initSocket(token)
    // Option A: emit socket (fast)
    s.emit('ride:accept', { rideId, driverId: 'driver-demo-id' }, (ack: any) => {
      console.log('accept ack', ack)
      if (ack?.ok) setRequests(prev => prev.filter(r => r.rideId !== rideId))
    })

    // Option B: also call HTTP mutation (to persist)
    try {
      await acceptRide({ rideId: rideId!, driverId: 'driver-demo-id' }).unwrap()
      setRequests(prev => prev.filter(r => r.rideId !== rideId))
    } catch (err) {
      console.error('accept http err', err)
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
      {requests.length === 0 ? <div>No incoming requests</div> : (
        <div className="space-y-3">
          {requests.map((r, i) => (
            <div key={i} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.pickup?.address} → {r.destination?.address}</div>
                <div className="text-sm text-gray-500">Fare: {r.fare ?? '—'}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleAccept(r.rideId)} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
                <button onClick={() => setRequests(prev => prev.filter((x, idx) => idx !== i))} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
