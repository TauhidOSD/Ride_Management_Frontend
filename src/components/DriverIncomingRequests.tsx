/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/DriverIncomingRequests.tsx */
import React, { useEffect, useState, useCallback } from "react";
import { initSocket } from "../lib/socket";
import { useAcceptRideMutation } from "../api/baseApi";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import toast from "react-hot-toast";

type IncomingRide = { rideId?: string; pickup?: any; destination?: any; fare?: number };

export default function DriverIncomingRequests() {
  const [requests, setRequests] = useState<IncomingRide[]>([]);
  const token = useSelector((s: RootState) => (s as any).auth?.token) ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  const user = useSelector((s: RootState) => (s as any).auth?.user) ?? JSON.parse(localStorage.getItem("user") || "null");
  const [acceptRide] = useAcceptRideMutation();
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const s = initSocket(token ?? undefined);
    if (!s) return;
    const onNew = (data: IncomingRide) => {
      setRequests(prev => {
        if (!data?.rideId) return [data, ...prev];
        if (prev.some(r => r.rideId === data.rideId)) return prev;
        return [data, ...prev];
      });
    };
    const onRemoved = (payload: any) => {
      if (!payload?.rideId) return;
      setRequests(prev => prev.filter(r => r.rideId !== payload.rideId));
    };
    const onUpdated = (payload: any) => {
      if (!payload?.rideId) return;
      if (payload.status === "accepted" || payload.status === "cancelled") {
        setRequests(prev => prev.filter(r => r.rideId !== payload.rideId));
      } else {
        setRequests(prev => prev.map(r => (r.rideId === payload.rideId ? { ...r, ...payload } : r)));
      }
    };

    s.on("ride:new", onNew);
    s.on("ride:removed", onRemoved);
    s.on("ride:updated", onUpdated);

    return () => {
      s.off("ride:new", onNew);
      s.off("ride:removed", onRemoved);
      s.off("ride:updated", onUpdated);
    };
  }, [token]);

  const handleAccept = useCallback(async (rideId?: string) => {
    if (!rideId) return toast.error("No rideId");
    if (!user?._id) return toast.error("Driver not identified");
    setProcessing(rideId);
    try {
      const res = await acceptRide({ rideId, driverId: user._id }).unwrap();
      console.log("accept HTTP res:", res);
      setRequests(prev => prev.filter(r => r.rideId !== rideId));
      toast.success("Ride accepted (saved)");
    } catch (err:any) {
      console.error("accept HTTP error", err);
      toast.error(err?.data?.message || err?.error || "Accept failed (HTTP)");
      setProcessing(null);
      return;
    }

    try {
      const s = initSocket(token ?? undefined);
      if (!s || !s.connected) {
        toast("Accepted (no realtime notify: socket not connected)");
        setProcessing(null);
        return;
      }
      s.emit("ride:accept", { rideId, driverId: user._id }, (ack:any) => {
        console.log("socket accept ack:", ack);
        if (!ack?.ok) toast.error(ack?.message || "Socket notify failed");
        else toast.success("Rider & drivers notified (socket)");
      });
    } catch (err) {
      console.error("socket emit error", err);
      toast.error("Socket notify error");
    } finally {
      setProcessing(null);
    }
  }, [acceptRide, token, user?._id]);

  const handleReject = useCallback((idx:number) => setRequests(prev => prev.filter((_,i)=>i!==idx)), []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
      {requests.length === 0 ? <div>No incoming requests</div> : (
        <div className="space-y-3">
          {requests.map((r,i)=>(
            <div key={r.rideId ?? i} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.pickup?.address ?? 'Unknown'} → {r.destination?.address ?? 'Unknown'}</div>
                <div className="text-sm text-gray-500">Fare: {r.fare ?? '—'}</div>
              </div>
              <div className="space-x-2">
                <button onClick={()=>handleAccept(r.rideId)} disabled={processing===r.rideId} className="px-3 py-1 bg-green-600 text-white rounded">
                  {processing===r.rideId ? "Accepting..." : "Accept"}
                </button>
                <button onClick={()=>handleReject(i)} className="px-3 py-1 bg-red-500 text-white rounded">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
