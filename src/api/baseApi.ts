import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000",
  }),
  tagTypes: ["Ride"],
  endpoints: (builder) => ({
    getRides: builder.query({
      query: () => "/api/rides",
      providesTags: ["Ride"],
    }),
  }),
});

export const { useGetRidesQuery } = baseApi;
