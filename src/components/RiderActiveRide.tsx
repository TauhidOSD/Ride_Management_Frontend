/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from 'react'
import { getSocket } from '../lib/socket'


type Props = {
  ride: any
}

export default function RiderActiveRide({ ride }: Props) {
  const [status, setStatus] = useState(ride.status)
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [message, setMessage] = useState('Waiting for driver...')

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    // ✅ Listen for ride status updates
    socket.on('ride:statusUpdated', (data: any) => {
      if (data.rideId === ride._id) {
        setStatus(data.status)
        setMessage(`Ride ${data.status.replace('_', ' ')}`)
      }
    })

    // ✅ Listen for driver location updates
    socket.on('driver:location', (data: any) => {
      if (data.rideId === ride._id) {
        setDriverLocation({ lat: data.lat, lng: data.lng })
      }
    })

    // ✅ Cleanup
    return () => {
      socket.off('ride:statusUpdated')
      socket.off('driver:location')
    }
  }, [ride._id])

  return (
    <div className='p-4 bg-white rounded-2xl shadow-md border'>
      <h2 className='text-lg font-semibold mb-2'>Active Ride</h2>
      <p className='text-sm mb-1'>Status: <span className='font-medium text-blue-600'>{status}</span></p>
      {driverLocation ? (
        <p className='text-sm'>Driver at: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}</p>
      ) : (
        <p className='text-sm italic text-gray-500'>Waiting for location...</p>
      )}
      <p className='text-sm text-gray-600 mt-2'>{message}</p>
    </div>
  )
}



// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* src/components/RiderActiveRide.tsx */
// import React, { useEffect, useState } from "react";
// import { initSocket } from "../lib/socket";

// export default function RiderActiveRide({ token, userId }: any) {
//   const [ride, setRide] = useState<any>(null);

//   useEffect(() => {
//     const s = initSocket(token ?? undefined);
//     if (!s) return;
//     const onAccepted = (payload:any) => {
//       setRide(payload.ride ?? { _id: payload.rideId, status: payload.status, driver: payload.driver });
//     };
//     const onStatus = (payload:any) => {
//       if (!payload?.rideId) return;
//       setRide((r: { _id: any; }) => r && String(r._id) === String(payload.rideId) ? { ...r, status: payload.status, ...(payload.ride ?? {}) } : r);
//     };
//     s.on("ride:accepted", onAccepted);
//     s.on("ride:statusUpdated", onStatus);
//     return ()=> { s.off("ride:accepted", onAccepted); s.off("ride:statusUpdated", onStatus); }
//   }, [token, userId]);

//   if (!ride) return <div className="p-4 bg-white rounded shadow">No active ride</div>;

//   return (
//     <div className="p-4 bg-white rounded shadow">
//       <h3 className="font-semibold">Your Active Ride</h3>
//       <div className="text-sm mt-2">
//         <div><strong>Driver:</strong> {ride.driver?.name ?? 'Assigned'}</div>
//         <div><strong>Status:</strong> {ride.status}</div>
//         <div><strong>Pickup:</strong> {ride.pickup?.address ?? ''}</div>
//         <div><strong>Destination:</strong> {ride.destination?.address ?? ''}</div>
//       </div>
//     </div>
//   );
// }
