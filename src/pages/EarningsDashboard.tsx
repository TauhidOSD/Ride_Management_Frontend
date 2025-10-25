/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
// src/pages/EarningsDashboard.tsx
import React, { useMemo, useState } from 'react'
import { useGetEarningsQuery } from '../api/baseApi'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
} from 'recharts'
import { useSelector } from 'react-redux'
import type { RootState } from '../app/store'

function safeToDateString(val: any) {
  // Accept Date object, ISO string, object with $date, or number
  if (!val) return ''
  try {
    if (val instanceof Date) return val.toISOString()
    if (typeof val === 'string') {
      const d = new Date(val)
      if (!isNaN(d.getTime())) return d.toISOString()
      return val
    }
    if (typeof val === 'number') return new Date(val).toISOString()
    if (val?.$date) return new Date(val.$date).toISOString()
    if (val?.period) return safeToDateString(val.period)
    return String(val)
  } catch (e) {
    return String(val)
  }
}

export default function EarningsDashboard() {
  const user = useSelector((s: RootState) => (s as any).auth?.user)
  const [range, setRange] = useState<'daily'|'weekly'|'monthly'>('monthly')
  const [from, setFrom] = useState<string | undefined>(undefined)
  const [to, setTo] = useState<string | undefined>(undefined)
  const driverId = user?.role === 'driver' ? user._id : undefined

  // Pass params as YYYY-MM-DD (frontend) — backend may expect ISO; if filters cause empty, try removing them
  const { data: raw = [], isLoading, error, refetch } = useGetEarningsQuery({ range, driverId, from, to })

  // DEBUG: show raw response in console
  console.log('[EarningsDashboard] raw response:', raw)

  // Normalize various response shapes:
  // raw can be: []  OR [{ period:..., totalRevenue:..., rideCount:...}] 
  // OR server may return { ok:true, data:[...] } but fetchBaseQuery transformResponse already did earlier.
  const normalized = Array.isArray(raw)
  ? raw
  : (raw && typeof raw === 'object' && 'data' in raw
      ? (raw as any).data
      : [])

  const chartData = useMemo(() => {
    if (!Array.isArray(normalized)) return []
    return normalized.map((d:any) => {
      // handle different field names: period, _id, date, period.$date
      const periodRaw = d.period ?? d._id ?? d.date ?? d._doc?.period
      const periodIso = safeToDateString(periodRaw)
      // friendly label
      let periodLabel = periodIso ? (new Date(periodIso)).toLocaleDateString() : (periodRaw ? String(periodRaw) : '')
      // if periodLabel still empty, fallback to index
      return {
        period: periodLabel || '—',
        revenue: Number(d.totalRevenue ?? d.total ?? d.revenue ?? d.sum ?? 0) || 0,
        rides: Number(d.rideCount ?? d.count ?? d.rideCount ?? 0) || 0,
        raw: d,
      }
    })
  }, [normalized])

  // Quick helper: widen range by clearing from/to
  const tryWithoutFilters = async () => {
    setFrom(undefined)
    setTo(undefined)
    await refetch()
  }

  // CSV export
  const exportCSV = () => {
    if (!chartData || chartData.length === 0) {
      alert('No data to export')
      return
    }
    const header = ['period','totalRevenue','rideCount']
    const rows = chartData.map(r => [r.period, r.revenue, r.rides].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings_${range}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Earnings Dashboard</h1>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
          <div className="flex gap-2 items-center">
            <button onClick={() => setRange('daily')} className={`px-3 py-1 rounded ${range==='daily' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Daily</button>
            <button onClick={() => setRange('weekly')} className={`px-3 py-1 rounded ${range==='weekly' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Weekly</button>
            <button onClick={() => setRange('monthly')} className={`px-3 py-1 rounded ${range==='monthly' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Monthly</button>
          </div>

          <div className="mt-3 md:mt-0 flex gap-2 items-center">
            <label className="text-sm">From:</label>
            <input type="date" className="p-2 border rounded" value={from ?? ''} onChange={(e)=>setFrom(e.target.value || undefined)} />
            <label className="text-sm">To:</label>
            <input type="date" className="p-2 border rounded" value={to ?? ''} onChange={(e)=>setTo(e.target.value || undefined)} />
            <button onClick={()=>refetch()} className="px-3 py-2 bg-green-600 text-white rounded">Apply</button>
            <button onClick={tryWithoutFilters} className="px-3 py-2 bg-gray-200 rounded">Clear / Show all</button>
          </div>

          <div className="ml-auto mt-3 md:mt-0">
            <button onClick={exportCSV} className="px-3 py-2 bg-indigo-600 text-white rounded">Export CSV</button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 bg-white rounded shadow">Loading analytics...</div>
        ) : error ? (
          <div className="p-6 bg-white rounded shadow text-red-600">Error loading analytics. Try refreshing or check your token.</div>
        ) : chartData.length === 0 ? (
          <div className="p-6 bg-white rounded shadow">
            <div>No data for selected range/filters.</div>
            <div className="mt-3 text-sm text-gray-600">Tip: Try clearing the date filters or widen the range.</div>
            <div className="mt-2">
              <button onClick={tryWithoutFilters} className="px-3 py-1 bg-blue-600 text-white rounded">Show all data</button>
            </div>
            <pre className="mt-4 p-2 bg-gray-100 text-xs overflow-auto">{JSON.stringify(normalized, null, 2)}</pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-2">Revenue</h3>
              <div style={{ width: '100%', height: 320 }}>
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
              <div style={{ width: '100%', height: 320 }}>
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
    </div>
  )
}
