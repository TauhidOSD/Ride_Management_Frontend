/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { useGetSummaryQuery } from '../api/baseApi'
import {
  CurrencyDollarIcon,
  CheckBadgeIcon,
  UserGroupIcon,
  TruckIcon,
} from '@heroicons/react/24/solid'

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  )
}

export default function SummaryCards() {
  const { data, isFetching, error, refetch } = useGetSummaryQuery()

  // fallback values
  const totalRides = data?.totalRides ?? 0
  const completedRides = data?.completedRides ?? 0
  const totalRevenue = data?.totalRevenue ?? 0
  const activeDrivers = data?.activeDrivers ?? 0
  const activeUsers = data?.activeUsers ?? 0

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Overview</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="px-3 py-1 bg-gray-100 rounded">Refresh</button>
          {isFetching && <div className="text-sm text-gray-500">Updating…</div>}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-3 rounded">Error loading summary</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Rides"
            value={totalRides}
            icon={<TruckIcon className="w-6 h-6 text-indigo-600" />}
          />
          <StatCard
            title="Completed Rides"
            value={completedRides}
            icon={<CheckBadgeIcon className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Total Revenue"
            value={`৳ ${Number(totalRevenue).toLocaleString()}`}
            icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />}
          />
          <StatCard
            title="Active Drivers / Users"
            value={`${activeDrivers} / ${activeUsers}`}
            icon={<UserGroupIcon className="w-6 h-6 text-pink-600" />}
          />
        </div>
      )}
    </div>
  )
}
