/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useGetRidesQuery } from "../api/baseApi";

export default function RideListRTK() {
  const { data, error, isLoading } = useGetRidesQuery(undefined);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error fetching rides</div>;

  const rides = Array.isArray(data) ? data : data?.rides ?? [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Available Rides</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rides.map((ride: any) => (
          <div
            key={ride._id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-semibold mb-2 text-lg">
              Ride ID: {(ride._id || "").slice(-6)}
            </h3>

            {/* SAFE: access nested object fields */}
            <p className="text-gray-700 text-sm">
              <strong>Pickup:</strong>{" "}
              {typeof ride.pickup === "string"
                ? ride.pickup
                : ride.pickup?.address ?? "—"}
            </p>

            <p className="text-gray-700 text-sm">
              <strong>Destination:</strong>{" "}
              {typeof ride.destination === "string"
                ? ride.destination
                : ride.destination?.address ?? "—"}
            </p>

            <p className="text-gray-700 text-sm">
              <strong>Fare:</strong> {typeof ride.fare === "number" ? `${ride.fare} ৳` : (ride.fare ?? "—")}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              {ride.createdAt ? new Date(ride.createdAt).toLocaleString() : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
