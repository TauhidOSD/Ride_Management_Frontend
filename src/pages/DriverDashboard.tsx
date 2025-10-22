import React from "react";
import DriverIncomingRequests from "../components/DriverIncomingRequests";

export default function DriverDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      <DriverIncomingRequests />
    </div>
  );
}
