// src/pages/DriverDashboard.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
//import DriverIncomingRequests from "../components/DriverIncomingRequests";
import ActiveRideCard from "../components/ActiveRideCard";
import SummaryCards from "../components/SummaryCards";
import { initSocket } from "../lib/socket";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import DriverIncomingRequests from "../components/DriverIncomingRequests";

export default function DriverDashboard() {
  const auth = useSelector((s: RootState) => (s as any).auth);
  const token = auth?.token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const user = auth?.user ?? JSON.parse(localStorage.getItem("user") || "null");
  const [activeRide, setActiveRide] = useState<any | null>(null);

  useEffect(() => {
    const s = initSocket(token, user?._id, "driver");
    if (!s) return;
    // driver-specific listeners
    const onAccepted = (payload: any) => {
      // if ride assigned to this driver
      if (payload?.driver?.id === user?._id) {
        setActiveRide(payload.ride ?? { _id: payload.rideId, status: payload.status });
      }
    };
    const onStatus = (payload: any) => {
      if (!payload?.rideId) return;
      if (activeRide && String(payload.rideId) === String(activeRide._id)) {
        setActiveRide((r:any) => ({ ...r, status: payload.status }));
      }
    };

    s.on("ride:accepted", onAccepted);
    s.on("ride:statusUpdated", onStatus);

    // optionally fetch currently ongoing ride via API here (if you persist current active ride)
    return () => {
      s.off("ride:accepted", onAccepted);
      s.off("ride:statusUpdated", onStatus);
    };
  }, [token, user?._id, activeRide]);

  return (
    <div className="p-4">
      <SummaryCards />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          {/* main workspace */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Active Ride</h2>
            <ActiveRideCard initialRide={activeRide} token={token ?? undefined} userId={user?._id} />
          </div>
          {/* other content like map / active tasks can go here */}
        </div>

        <div className="col-span-1">
          <DriverIncomingRequests />
        </div>
      </div>
    </div>
  );
}
