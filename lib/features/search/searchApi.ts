import { baseApi } from '../../services/api';
import type { SearchRequest } from '../../types';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<{ success: boolean; data: any[] }, SearchRequest>({
      query: ({ q, type = 'foryou', page = 1, limit = 20 }) =>
        `/search?q=${encodeURIComponent(q || '')}&type=${type}&page=${page}&limit=${limit}`,
      providesTags: ['Search'],
    }),
    getRecentSearches: builder.query<{ success: boolean; data: any[] }, number | void>({
      query: (limit = 20) => `/search/recent?limit=${limit}`,
    }),
    removeRecentSearch: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/search/recent/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useSearchQuery,
  useLazySearchQuery,
  useGetRecentSearchesQuery,
  useRemoveRecentSearchMutation,
} = searchApi;
