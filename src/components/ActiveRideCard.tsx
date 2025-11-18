/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/ActiveRideCard.tsx */
import { useCallback, useEffect, useState } from "react";
import { getSocket, initSocket } from "../lib/socket";
import { useUpdateRideStatusMutation } from "../api/baseApi";
import toast from "react-hot-toast";
import { startSharingLocation, stopSharingLocation } from "../lib/location";

type Ride = {
  _id: string;
  pickup?: { address?: string };
  destination?: { address?: string };
  fare?: number;
  status?: string;
  rider?: string;
  driver?: string;
  createdAt?: string;
};

export default function ActiveRideCard({
  initialRide,
  token,
  userId,
}: {
  initialRide: Ride | null;
  token?: string;
  userId?: string;
}) {
  const [ride, setRide] = useState<Ride | null>(initialRide ?? null);
  const [updateStatus] = useUpdateRideStatusMutation();
  const [processing, setProcessing] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    // ensure socket exists and listen for updates to this ride
    const s = initSocket(token ?? undefined);
    if (!s) return;
    const onStatus = (payload: any) => {
      if (!payload?.rideId) return;
      if (ride && String(payload.rideId) === String(ride._id)) {
        console.log("[ActiveRideCard] ride:statusUpdated payload", payload);
        setRide((r) => (r ? { ...r, status: payload.status, ...(payload.ride ?? {}) } : r));
      }
    };
    const onAccepted = (payload: any) => {
      // if this driver accepted then set ride active (if driver matches)
      if (payload?.driver?.id === userId) {
        console.log("[ActiveRideCard] ride:accepted payload", payload);
        setRide((r) => (payload.ride ? payload.ride : r));
      }
    };

    s.on("ride:statusUpdated", onStatus);
    s.on("ride:accepted", onAccepted);

    return () => {
      s.off("ride:statusUpdated", onStatus);
      s.off("ride:accepted", onAccepted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userId, ride?._id]);

  const changeStatus = useCallback(
    async (newStatus: string) => {
      if (!ride) return;
      setProcessing(true);
      try {
        // 1) call HTTP to persist
        const res = await updateStatus({ rideId: ride._id, status: newStatus, driverId: userId }).unwrap();
        console.log("[ActiveRideCard] updateStatus res", res);

        // 2) emit socket notification to notify rider/others
        const s = getSocket() ?? initSocket(token ?? undefined);
        if (s && s.connected) {
          s.emit(
            "ride:status",
            { rideId: ride._id, status: newStatus },
            (ack: any) => {
              console.log("[ActiveRideCard] socket status ack:", ack);
              if (!ack?.ok) {
                toast.error(ack?.message || "Socket notify failed");
              } else {
                toast.success("Status updated & notified");
              }
            }
          );
        } else {
          toast.success("Status updated (no socket)");
        }

        // optimistic update
        setRide((r) => (r ? { ...r, status: newStatus } : r));
      } catch (err: any) {
        console.error("update status error", err);
        toast.error(err?.data?.message || err?.error || "Failed to update status");
      } finally {
        setProcessing(false);
      }
    },
    [ride, updateStatus, token, userId]
  );

  if (!ride)
    return <div className="p-4 bg-white rounded shadow">No active ride</div>;

  const nextActions: Record<string, string | null> = {
    requested: "accepted",
    accepted: "picked_up",
    picked_up: "in_transit",
    in_transit: "completed",
    completed: null,
    cancelled: null,
  };

  const next = nextActions[ride.status ?? "requested"] ?? null;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Active Ride</h3>

      <div className="text-sm text-gray-700 mb-2">
        <div>
          <strong>Pickup:</strong> {ride.pickup?.address ?? "N/A"}
        </div>
        <div>
          <strong>Destination:</strong> {ride.destination?.address ?? "N/A"}
        </div>
        <div>
          <strong>Fare:</strong> {ride.fare ?? "—"} ৳
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {ride.createdAt ? new Date(ride.createdAt).toLocaleString() : ""}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <div className="px-3 py-1 bg-gray-100 rounded capitalize">{ride.status ?? "unknown"}</div>

        {next ? (
          <button
            onClick={() => changeStatus(next as string)}
            disabled={processing}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            {processing ? "Processing..." : `Mark ${next.replace("_", " ")}`}
          </button>
        ) : (
          <div className="text-sm text-gray-500">No further actions</div>
        )}

        {/* Location sharing toggle */}
        <button
          onClick={() => {
            if (!sharing) {
              startSharingLocation(ride._id, token);
              setSharing(true);
              toast.success("Started sharing location");
            } else {
              stopSharingLocation();
              setSharing(false);
              toast.success("Stopped sharing location");
            }
          }}
          className={`px-3 py-1 rounded ${sharing ? "bg-red-500 text-white" : "bg-blue-600 text-white"}`}
        >
          {sharing ? "Stop Sharing" : "Share Location"}
        </button>
      </div>
    </div>
  );
}
