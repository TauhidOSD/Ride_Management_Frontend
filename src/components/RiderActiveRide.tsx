/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/RiderActiveRide.tsx */
import React, { useEffect, useState } from "react";
import { initSocket } from "../lib/socket";

export default function RiderActiveRide({ token, userId }: any) {
  const [ride, setRide] = useState<any>(null);

  useEffect(() => {
    const s = initSocket(token ?? undefined);
    if (!s) return;
    const onAccepted = (payload:any) => {
      setRide(payload.ride ?? { _id: payload.rideId, status: payload.status, driver: payload.driver });
    };
    const onStatus = (payload:any) => {
      if (!payload?.rideId) return;
      setRide((r: { _id: any; }) => r && String(r._id) === String(payload.rideId) ? { ...r, status: payload.status, ...(payload.ride ?? {}) } : r);
    };
    s.on("ride:accepted", onAccepted);
    s.on("ride:statusUpdated", onStatus);
    return ()=> { s.off("ride:accepted", onAccepted); s.off("ride:statusUpdated", onStatus); }
  }, [token, userId]);

  if (!ride) return <div className="p-4 bg-white rounded shadow">No active ride</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold">Your Active Ride</h3>
      <div className="text-sm mt-2">
        <div><strong>Driver:</strong> {ride.driver?.name ?? 'Assigned'}</div>
        <div><strong>Status:</strong> {ride.status}</div>
        <div><strong>Pickup:</strong> {ride.pickup?.address ?? ''}</div>
        <div><strong>Destination:</strong> {ride.destination?.address ?? ''}</div>
      </div>
    </div>
  );
}
