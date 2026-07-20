import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define our base API
// Automatically handles standard headers, auth tokens, etc. if configured
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://backend.neerajprajapati.in/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // If we have a token in state, let's assume that we should be passing it.
      // This is a placeholder for wherever the token is stored
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Post', 'Chat', 'Marketplace', 'Auth'],
  endpoints: () => ({}),
});
