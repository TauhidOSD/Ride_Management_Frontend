/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/RideHistory.tsx
import React, { useState } from 'react'
import { useGetRidesPaginatedQuery } from '../api/baseApi'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

export default function RideHistory() {
  const user = useSelector((s: RootState) => (s as any).auth?.user)
  const role = user?.role
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading, isFetching, error } = useGetRidesPaginatedQuery({
    page,
    limit,
    role: role === 'driver' ? 'driver' : role === 'rider' ? 'rider' : undefined,
    search: search || undefined,
    status: status || undefined,
  })

  const rides = data?.rides ?? []
  const total = data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Ride History</h1>

      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pickup/destination/rideId" className="p-2 border rounded flex-1" />
        <select value={status} onChange={e=>setStatus(e.target.value)} className="p-2 border rounded">
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="accepted">Accepted</option>
          <option value="picked_up">Picked Up</option>
          <option value="in_transit">In Transit</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button onClick={()=>{ setPage(1) }} className="px-3 py-2 bg-blue-600 text-white rounded">Filter</button>
      </div>

      {isLoading ? <div>Loading...</div> : error ? <div className="text-red-600">Error loading rides</div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rides.map((r:any)=> (
              <div key={r._id} className="bg-white p-4 rounded shadow">
                <div className="font-semibold mb-1">#{(r._id||'').slice(-6)} — {r.status}</div>
                <div className="text-sm"><strong>Pickup:</strong> {r.pickup?.address}</div>
                <div className="text-sm"><strong>Destination:</strong> {r.destination?.address}</div>
                <div className="text-sm"><strong>Fare:</strong> {r.fare ?? '—'} ৳</div>
                <div className="text-xs text-gray-500 mt-2">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>Showing {rides.length} of {total}</div>
            <div className="space-x-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Prev</button>
              <span>Page {page} / {pages}</span>
              <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(p+1,pages))} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
