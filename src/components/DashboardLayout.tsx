/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DashboardLayout.tsx

import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout({ children }: any) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white p-4 border-r hidden md:block">
        <div className="font-bold mb-4">Dashboard</div>
        <nav className="flex flex-col gap-2">
          <Link to="/dashboard" className="px-3 py-2 rounded hover:bg-gray-50">Overview</Link>
          <Link to="/dashboard/earnings" className="px-3 py-2 rounded hover:bg-gray-50">Earnings</Link>
          <Link to="/dashboard/history" className="px-3 py-2 rounded hover:bg-gray-50">History</Link>
          <Link to="/dashboard/requests" className="px-3 py-2 rounded hover:bg-gray-50">Incoming</Link>
        </nav>
      </aside>
      <div className="flex-1 p-6">
        {children || <Outlet />}
      </div>
    </div>
  );
}
