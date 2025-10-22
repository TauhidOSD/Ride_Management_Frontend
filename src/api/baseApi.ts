/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Ride = {
  _id: string
  pickup?: { address?: string; lat?: number; lng?: number }
  destination?: { address?: string; lat?: number; lng?: number }
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
    getRides: builder.query<Ride[], void>({
      query: () => '/api/rides',
      providesTags: (result) =>
        result ? result.map((r) => ({ type: 'Ride' as const, id: r._id })) : [{ type: 'Ride' as const, id: 'LIST' }],
    }),
    // NEW: bookRide mutation
    bookRide: builder.mutation<
      Ride, // response type
      { pickup: any; destination: any; fare?: number; paymentMethod?: string } // arg type
    >({
      query: (body) => ({
        url: '/api/rides/book',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ride', id: 'LIST' }],
    }),
  }),
})

export const { useGetRidesQuery, useBookRideMutation } = baseApi
