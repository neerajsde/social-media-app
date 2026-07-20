import { baseApi } from '../../services/api';
import type {
  RecentSearchResult,
  SearchRequest,
  SearchTagResult,
  SearchTrendingResult,
  SearchUserResult,
  SearchPostResult,
} from '../../types';

type SearchResponse<T> = { success: boolean; message: string; data: T };

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    search: builder.query<
      SearchResponse<SearchUserResult[] | SearchTagResult[] | SearchTrendingResult[] | SearchPostResult[]>,
      SearchRequest
    >({
      query: ({ q, type = 'foryou', page = 1, limit = 20 }) => {
        const params = new URLSearchParams({
          type,
          page: String(page),
          limit: String(limit),
        });
        if (q) params.set('q', q);
        return `/search?${params.toString()}`;
      },
      providesTags: ['Search'],
    }),
    getRecentSearches: builder.query<SearchResponse<RecentSearchResult[]>, number | void>({
      query: (limit = 20) => `/search/recent?limit=${limit}`,
      providesTags: ['Search'],
    }),
    removeRecentSearch: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/search/recent/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Search'],
    }),
  }),
});

export const {
  useSearchQuery,
  useLazySearchQuery,
  useGetRecentSearchesQuery,
  useRemoveRecentSearchMutation,
} = searchApi;
