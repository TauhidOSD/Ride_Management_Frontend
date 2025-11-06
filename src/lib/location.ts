/* eslint-disable @typescript-eslint/no-unused-vars */
// src/lib/location.ts
import { getSocket, initSocket } from "./socket";

let watchId: number | null = null;

export function startSharingLocation(rideId: string, token?: string, intervalMs = 3000) {
  if (!rideId) return;
  // ensure socket
  const s = getSocket() ?? initSocket(token ?? undefined);
  if (!s) {
    console.warn('startSharingLocation: socket not available');
    return;
  }

  // use geolocation.watchPosition for continuous updates
  if (!("geolocation" in navigator)) {
    console.warn("Geolocation not available in this browser");
    return;
  }

  if (watchId !== null) {
    // already watching
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const speed = pos.coords.speed ?? null;
      const heading = pos.coords.heading ?? null;
      s.emit('driver:location', { rideId, lat, lng, speed, heading });
    },
    (err) => {
      console.error("geolocation watch error", err);
    },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
  );
}

export function stopSharingLocation() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
}
