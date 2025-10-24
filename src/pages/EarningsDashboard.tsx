/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react'
import { useGetEarningsQuery } from '../api/baseApi'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

export default function EarningsDashboard() {
  const user = useSelector((s: RootState) => (s as any).auth?.user)
  const [range, setRange] = useState<'daily'|'weekly'|'monthly'>('monthly')
  const driverId = user?.role === 'driver' ? user._id : undefined

  const { data = [], isLoading, error } = useGetEarningsQuery({ range, driverId })

  // normalize data for charts (format period date string nicely)
  const chartData = useMemo(() => {
    return data.map((d:any) => ({
      period: new Date(d.period).toLocaleDateString(),
      revenue: d.totalRevenue,
      rides: d.rideCount,
    }))
  }, [data])

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Earnings Dashboard</h1>

      <div className="mb-4 flex gap-3">
        <button onClick={() => setRange('daily')} className={`px-3 py-1 rounded ${range==='daily' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Daily</button>
        <button onClick={() => setRange('weekly')} className={`px-3 py-1 rounded ${range==='weekly' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Weekly</button>
        <button onClick={() => setRange('monthly')} className={`px-3 py-1 rounded ${range==='monthly' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Monthly</button>
      </div>

      {isLoading ? <div>Loading...</div> : error ? <div className="text-red-600">Error loading analytics</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-2">Revenue</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h3 className="font-semibold mb-2">Ride Count</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="rides" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
