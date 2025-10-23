/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react'
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from '../api/baseApi'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetMyProfileQuery()
  const [updateProfile] = useUpdateMyProfileMutation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(()=> {
    if (profile) {
      setName(profile.name ?? '')
      setPhone(profile.phone ?? '')
      setVehicle(profile.vehicle ? JSON.stringify(profile.vehicle) : '')
    }
  }, [profile])

  const handleSave = async (e:any) => {
    e.preventDefault()
    setBusy(true)
    try {
      const vehicleObj = vehicle ? JSON.parse(vehicle) : undefined
      await updateProfile({ name, phone, vehicle: vehicleObj, ...(password ? { password } : {}) }).unwrap()
      toast.success('Profile updated')
      setPassword('')
    } catch (err:any) {
      console.error(err)
      toast.error(err?.data?.message || err?.error || 'Update failed')
    } finally { setBusy(false) }
  }

  if (isLoading) return <div className="p-4">Loading profile…</div>

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input className="w-full p-2 border rounded" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input className="w-full p-2 border rounded" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Vehicle (JSON)</label>
          <textarea className="w-full p-2 border rounded" rows={3} value={vehicle} onChange={e=>setVehicle(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Change password</label>
          <input type="password" className="w-full p-2 border rounded" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded">{busy ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
