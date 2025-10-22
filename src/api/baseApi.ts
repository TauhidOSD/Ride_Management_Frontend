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
  }),
  tagTypes: ['Ride'],
  endpoints: (builder) => ({
    // GET all rides
    getRides: builder.query<Ride[], void>({
      query: () => '/api/rides',
      providesTags: (result) =>
        result ? result.map((r) => ({ type: 'Ride' as const, id: r._id })) : [{ type: 'Ride' as const, id: 'LIST' }],
    }),

    // GET single ride (optional, helpful for ActiveRide)
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
      { ok: boolean; ride: Ride }, // response type
      { rideId: string; driverId?: string } // arg type
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
  }),
})

export const {
  useGetRidesQuery,
  useGetRideByIdQuery,
  useBookRideMutation,
  useAcceptRideMutation,
  useUpdateRideStatusMutation,
} = baseApi
