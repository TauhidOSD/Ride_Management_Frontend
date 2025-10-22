/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const [bookRide, { isLoading }] = useBookRideMutation()
  const token = useSelector((s: RootState) => (s as any).auth?.token)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        pickup: { address: pickup },
        destination: { address: destination },
        fare: typeof fare === 'number' ? fare : undefined,
        paymentMethod,
      }
      const res = await bookRide(body).unwrap()
      toast.success('Ride booked')

      // ensure socket connected; emit ride request for drivers
      const s = initSocket(token)
      s.emit('ride:request', {
        rideId: res._id,
        pickup: body.pickup,
        destination: body.destination,
        fare: body.fare ?? 0,
      })

      // reset
      setPickup(''); setDestination(''); setFare('')
    } catch (err: any) {
      console.error(err)
      toast.error(err?.data?.message || err?.error || 'Booking failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Book a Ride</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Pickup Location" className="w-full p-2 border rounded" required />
        <input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Destination" className="w-full p-2 border rounded" required />
        <input value={fare} onChange={e=>setFare(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Fare (optional)" className="w-full p-2 border rounded" />
        <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)} className="w-full p-2 border rounded">
          <option value="cash">Cash</option>
          <option value="card">Card</option>
        </select>
        <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white p-2 rounded">
          {isLoading ? 'Booking...' : 'Book Ride'}
        </button>
      </form>
    </div>
  )
}
