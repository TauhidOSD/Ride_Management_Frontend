/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/api/baseApi.ts */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Ride = {
  _id: string
  pickup?: { address?: string }
  destination?: { address?: string }
  fare?: number
  status?: string
  createdAt?: string
}

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    // use `any` for getState to avoid circular import TypeScript errors
    prepareHeaders: (headers, { getState }: { getState: any }) => {
      try {
        const state = getState() as any
        const token = state?.auth?.token ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null)
        if (token) headers.set('authorization', `Bearer ${token}`)
      } catch (e) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (token) headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Ride', 'User'],
  endpoints: (builder) => ({
    // GET all rides
    getRides: builder.query<Ride[], void>({
      query: () => '/api/rides',
      providesTags: (result) =>
        result ? result.map((r) => ({ type: 'Ride' as const, id: r._id })) : [{ type: 'Ride' as const, id: 'LIST' }],
    }),

    // GET single ride (helpful for ActiveRide)
    getRideById: builder.query<Ride, string>({
      query: (id) => `/api/rides/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ride', id }],
    }),

    // POST book a ride
    bookRide: builder.mutation<Ride, { pickup: any; destination: any; fare?: number; paymentMethod?: string }>({
      query: (body) => ({ url: '/api/rides/book', method: 'POST', body }),
      invalidatesTags: [{ type: 'Ride', id: 'LIST' }],
    }),

    // PATCH accept a ride (driver)
    acceptRide: builder.mutation<
      { ok: boolean; ride: Ride },
      { rideId: string; driverId?: string }
    >({
      query: ({ rideId, driverId }) => ({
        url: `/api/rides/${rideId}/status`,
        method: 'PATCH',
        body: { status: 'accepted', driverId },
      }),
      invalidatesTags: (result, error, { rideId }) => [
        { type: 'Ride', id: rideId },
        { type: 'Ride', id: 'LIST' },
      ],
    }),

    // Generic status update (picked_up, in_transit, completed, cancelled, etc.)
    updateRideStatus: builder.mutation<
      { ok: boolean; ride: Ride },
      { rideId: string; status: string; driverId?: string }
    >({
      query: ({ rideId, status, driverId }) => ({
        url: `/api/rides/${rideId}/status`,
        method: 'PATCH',
        body: { status, driverId },
      }),
      invalidatesTags: (result, error, { rideId }) => [
        { type: 'Ride', id: rideId },
        { type: 'Ride', id: 'LIST' },
      ],
    }),

    // Paginated rides (search, status, role)
    getRidesPaginated: builder.query<
      { rides: Ride[]; total: number; page: number; limit: number },
      { page?: number; limit?: number; role?: 'rider' | 'driver' | 'admin' | undefined; search?: string; status?: string } | void
    >({
      // accept undefined / void as param
      query: (params = {}) => {
        const { page = 1, limit = 10, role, search, status } = params as any
        const qp = new URLSearchParams()
        qp.set('page', String(page))
        qp.set('limit', String(limit))
        if (role) qp.set('role', role)
        if (search) qp.set('search', search)
        if (status) qp.set('status', status)
        return `/api/rides/paginated?${qp.toString()}`
      },
      providesTags: (result) =>
        result ? result.rides.map((r) => ({ type: 'Ride' as const, id: r._id })) : [{ type: 'Ride' as const, id: 'LIST' }],
    }),


    getEarnings: builder.query<
      { period: string; totalRevenue: number; rideCount: number }[],
      { range?: 'daily' | 'weekly' | 'monthly'; driverId?: string; from?: string; to?: string } | void
    >({
      query: (params = {}) => {
        const { range = 'monthly', driverId, from, to } = params as any
        const qp = new URLSearchParams()
        qp.set('range', range)
        if (driverId) qp.set('driverId', driverId)
        if (from) qp.set('from', from)
        if (to) qp.set('to', to)
        return `/api/analytics/earnings?${qp.toString()}`
      },
      transformResponse: (response: any) => {
        // backend returns { ok: true, data: [...] }
        return response?.data ?? []
      },
      providesTags: [{ type: 'Ride', id: 'LIST' }],
    }),




    // Profile endpoints
    getMyProfile: builder.query<any, void>({
      query: () => '/api/users/me',
      providesTags: [{ type: 'User' as const, id: 'ME' }],
    }),
    updateMyProfile: builder.mutation<any, { name?: string; phone?: string; vehicle?: any; password?: string }>({
      query: (body) => ({ url: '/api/users/me', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'User' as const, id: 'ME' }],
    }),
  }),
})

export const {
  useGetRidesQuery,
  useGetRideByIdQuery,
  useGetRidesPaginatedQuery,
  useBookRideMutation,
  useAcceptRideMutation,
  useUpdateRideStatusMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
   useGetEarningsQuery,
} = baseApi
