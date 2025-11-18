/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/ActiveRide.tsx
import  { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useGetRideByIdQuery, useUpdateRideStatusMutation } from '../api/baseApi'
import { initSocket } from '../lib/socket'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import toast from 'react-hot-toast'

export default function ActiveRide() {
  const { id } = useParams<{ id: string }>()
  const { data: ride, refetch } = useGetRideByIdQuery(id!, { skip: !id })
  const [updateRideStatus] = useUpdateRideStatusMutation()
  const token = useSelector((state: RootState) => (state as any).auth?.token)
  const user = useSelector((state: RootState) => (state as any).auth?.user)
  const role = user?.role ?? null
  const [status, setStatus] = useState<string | undefined>(ride?.status)
  const [busy, setBusy] = useState(false)

  useEffect(() => setStatus(ride?.status), [ride?.status])

  useEffect(() => {
    if (!id) return
    const s = initSocket(token, user?._id, role)
    if (!s) {
      // socket couldn't be initialized; nothing to subscribe to
      return
    }

    const onStatus = (payload: any) => {
      if (payload?.rideId === id) {
        setStatus(payload.status)
        refetch()
      }
    }
    // server emits ride:statusUpdated or ride:status — listen both
    s.on('ride:statusUpdated', onStatus)
    s.on('ride:updated', onStatus)
    s.on('ride:accepted', onStatus)
    return () => {
      // s is definitely not null here (narrowed by the check above)
      s.off('ride:statusUpdated', onStatus)
      s.off('ride:updated', onStatus)
      s.off('ride:accepted', onStatus)
    }
  }, [id, token, user?._id, role, refetch])

  const doStatusUpdate = useCallback(
    async (newStatus: string) => {
      if (!id) return
      setBusy(true)
      try {
        // 1) persist via HTTP
        const res = await updateRideStatus({ rideId: id, status: newStatus, driverId: user?._id }).unwrap()
        console.log('updateRideStatus result', res)
        // 2) notify via socket (guard for null)
        try {
          const s = initSocket(token, user?._id, role)
          if (s) {
            s.emit('ride:status', { rideId: id, status: newStatus }, (ack: any) => {
              console.log('ride:status ack', ack)
            })
          } else {
            console.warn('Socket not initialized — skipping emit')
          }
        } catch (err) {
          console.error('socket notify error', err)
        }
        toast.success(`Status updated: ${newStatus}`)
        setStatus(newStatus)
      } catch (err: any) {
        console.error('update status error', err)
        toast.error(err?.data?.message || err?.error || 'Status update failed')
      } finally {
        setBusy(false)
      }
    },
    [id, updateRideStatus, token, user?._id, role]
  )

  if (!id) return <div className="p-4">No ride selected</div>
  if (!ride) return <div className="p-4">Loading ride…</div>

  const timelineOrder = [
    { key: 'requested', label: 'Requested' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Ride #{(ride._id || '').slice(-6)}</h2>

      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2"><strong>Pickup:</strong> {ride.pickup?.address}</div>
        <div className="text-sm text-gray-600 mb-2"><strong>Destination:</strong> {ride.destination?.address}</div>
        <div className="text-sm text-gray-600 mb-2"><strong>Fare:</strong> {ride.fare ?? '—'} ৳</div>
      </div>

      <div className="space-y-2">
        {timelineOrder.map((t) => {
          const active = status === t.key
          const className = active ? 'bg-green-100' : 'bg-gray-100'
          return (
            <div key={t.key} className={`p-3 rounded ${className}`}>
              <strong>{t.label}</strong> {active ? <span className="text-sm text-gray-600 ml-2">●</span> : null}
            </div>
          )
        })}
      </div>

      {/* Driver controls */}
      {role === 'driver' && (
        <div className="mt-6 flex gap-3">
          {/* show only relevant next actions depending on current status */}
          {status === 'accepted' && (
            <button onClick={() => doStatusUpdate('picked_up')} disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded">
              {busy ? 'Processing...' : 'Mark Picked Up'}
            </button>
          )}
          {status === 'picked_up' && (
            <button onClick={() => doStatusUpdate('in_transit')} disabled={busy} className="px-4 py-2 bg-indigo-600 text-white rounded">
              {busy ? 'Processing...' : 'Mark In Transit'}
            </button>
          )}
          {status === 'in_transit' && (
            <button onClick={() => doStatusUpdate('completed')} disabled={busy} className="px-4 py-2 bg-green-600 text-white rounded">
              {busy ? 'Processing...' : 'Mark Completed'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
