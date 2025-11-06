/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { initSocket } from "../lib/socket";

export default function DriverLiveLocation({ rideId, token }: { rideId: string | null, token?: string | null }) {
  const [loc, setLoc] = useState<{ lat:number, lng:number, ts:number } | null>(null);

  useEffect(() => {
    const s = initSocket(token ?? undefined);
    if (!s) return;
    const handler = (payload:any) => {
      if (!payload?.rideId || payload.rideId !== rideId) return;
      setLoc({ lat: payload.lat, lng: payload.lng, ts: payload.ts ?? Date.now() });
    };
    s.on('driver:location', handler);
    return () => {
      s.off('driver:location', handler);
    };
  }, [rideId, token]);

  if (!rideId) return null;
  if (!loc) return <div className="p-3 bg-white rounded shadow">Driver location not available yet</div>;

  const mapsUrl = `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=16`;

  return (
    <div className="p-3 bg-white rounded shadow">
      <div className="text-sm font-semibold">Driver Live Location</div>
      <div className="text-xs text-gray-600 mt-1">Updated: {new Date(loc.ts).toLocaleTimeString()}</div>
      <div className="mt-2">
        <div><strong>Lat:</strong> {loc.lat.toFixed(6)}</div>
        <div><strong>Lng:</strong> {loc.lng.toFixed(6)}</div>
      </div>
      <div className="mt-2">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open in Google Maps</a>
      </div>
    </div>
  );
}
