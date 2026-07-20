import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../store';
import { setCredentials, logout } from '../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7682/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

let isRefreshing = false;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const state = api.getState() as RootState;
    const refreshToken = state.auth?.refreshToken;

    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResult = await baseQuery(
            {
              url: '/auth/refresh-token',
              method: 'POST',
              body: { token: refreshToken },
            },
            api,
            extraOptions
          );

          const responseData = refreshResult.data as any;
          if (responseData && responseData.accessToken) {
            api.dispatch(
              setCredentials({
                accessToken: responseData.accessToken,
                refreshToken: responseData.refreshToken || refreshToken,
                user: state.auth.user || undefined,
              })
            );
            // Retry the original query with the new access token
            result = await baseQuery(args, api, extraOptions);
          } else {
            api.dispatch(logout());
          }
        } catch (err) {
          api.dispatch(logout());
        } finally {
          isRefreshing = false;
        }
      } else {
        // Yield execution to allow ongoing refresh to complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Retry the original query
        result = await baseQuery(args, api, extraOptions);
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Post', 'Feed', 'Comments', 'Chat', 'Search', 'Notifications', 'Auth', 'Profile'],
  endpoints: () => ({}),
});
