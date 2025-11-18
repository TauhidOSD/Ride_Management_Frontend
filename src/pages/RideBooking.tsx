/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/pages/RideBooking.tsx */
import React, { useState } from 'react'
import { useBookRideMutation } from '../api/baseApi'
import { initSocket } from '../lib/socket'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'
import toast from 'react-hot-toast'


export default function RideBooking() {
  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [fare, setFare] = useState<number | ''>('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [submitting, setSubmitting] = useState(false)
  const [lastBooking, setLastBooking] = useState<{ id: string; fare?: number } | null>(null)

  const [bookRide] = useBookRideMutation()
  const token = useSelector((s: RootState) => (s as any).auth?.token) ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const validate = () => {
    if (!pickup.trim()) { toast.error('Pickup location required'); return false }
    if (!destination.trim()) { toast.error('Destination required'); return false }
    if (fare !== '' && (isNaN(Number(fare)) || Number(fare) < 0)) { toast.error('Fare must be a positive number'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const body = {
      pickup: { address: pickup.trim() },
      destination: { address: destination.trim() },
      fare: typeof fare === 'number' ? fare : undefined,
      paymentMethod,
    }

    const toastId = toast.loading('Booking ride...')
    try {
      const res = await bookRide(body).unwrap() // RTK mutation call

      // show success toast first
      toast.success('Ride booked successfully', { id: toastId })

      // store last booking info for small confirmation box
      setLastBooking({ id: res._id, fare: res.fare })

      // try socket notify to drivers (if socket available)
      try {
        const s = initSocket(token) // should return socket or existing socket
        if (s && typeof s.emit === 'function') {
          s.emit('ride:request', {
            rideId: res._id,
            pickup: body.pickup,
            destination: body.destination,
            fare: body.fare ?? 0,
          }, (ack: any) => {
            if (ack?.ok) {
              toast.success('Drivers notified (real-time)')
            } else {
              toast.error(ack?.message || 'Drivers notification failed')
            }
          })
        } else {
          // no socket available — that's fine, backend still has ride
          toast('Socket not connected — request saved', { icon: 'ℹ️' })
        }
      } catch (sockErr) {
        console.warn('socket emit error', sockErr)
        toast('Could not notify drivers in real-time', { icon: '⚠️' })
      }

      // reset form
      setPickup('')
      setDestination('')
      setFare('')
      setPaymentMethod('cash')
    } catch (err: any) {
      console.error('bookRide error', err)
      // RTK Query error shape may vary; handle common cases
      const msg = err?.data?.message || err?.error || err?.message || 'Booking failed'
      toast.error(msg, { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-12 px-4">
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Book a Ride</h2>
          <p className="text-sm text-gray-500 mt-1">Enter pickup & destination — drivers nearby will be notified.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Pickup</label>
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="e.g. Dhanmondi, 27/A"
              className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Destination</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Gulshan 2"
              className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Estimated Fare (optional)</label>
              <input
                value={fare !== '' ? String(fare) : ''}
                onChange={(e) => setFare(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 150"
                inputMode="numeric"
                className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-2 w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium shadow ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {submitting ? 'Booking…' : 'Book Ride'}
            </button>

            <button
              type="button"
              onClick={() => {
                setPickup(''); setDestination(''); setFare(''); setPaymentMethod('cash'); setLastBooking(null)
                toast('Form cleared', { icon: '✳️' })
              }}
              className="px-4 py-3 rounded-lg bg-gray-50 border text-sm"
            >
              Clear
            </button>
          </div>

          {lastBooking && (
            <div className="mt-2 p-3 border-l-4 border-indigo-500 bg-indigo-50 rounded">
              <div className="text-sm text-indigo-800">Booking created — ID: <span className="font-mono">{lastBooking.id}</span></div>
              {lastBooking.fare !== undefined && <div className="text-sm text-gray-600">Fare: {lastBooking.fare} ৳</div>}
              <div className="text-xs text-gray-500 mt-1">You will be notified when a driver accepts.</div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
