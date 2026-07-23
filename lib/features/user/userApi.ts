import { baseApi } from '../../services/api';
import type { User } from '../../types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; user: User }, void>({
      query: () => '/user/profile',
      providesTags: ['Profile'],
    }),
    getUserProfileByUsername: builder.query<{ success: boolean; user: User }, string>({
      query: (username) => `/user/profile/${username}`,
      providesTags: (result, error, username) => [{ type: 'Profile', id: username }],
    }),
    getSuggestedUsers: builder.query<{ success: boolean; users: User[] }, { limit?: number }>({
      query: ({ limit = 4 }) => `/user/suggested?limit=${limit}`,
    }),
    updateProfile: builder.mutation<{ success: boolean; message: string; data: any }, any>({
      query: (body) => ({
        url: '/user/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateAvatar: builder.mutation<{ success: boolean; avatarUrl: string }, { fileKey: string }>({
      query: (body) => ({
        url: '/user/profile/avatar',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateBanner: builder.mutation<{ success: boolean; bannerUrl: string }, { fileKey: string }>({
      query: (body) => ({
        url: '/user/profile/banner',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateSocialLinks: builder.mutation<{ success: boolean }, Record<string, string | null>>({
      query: (body) => ({
        url: '/user/social-links',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    generatePresignedUrl: builder.mutation<{ success: boolean; uploadUrl: string; fileKey: string }, { mimeType: string }>({
      query: (body) => ({
        url: '/user/presigned-url',
        method: 'POST',
        body,
      }),
    }),
    checkUsername: builder.query<{ success: boolean; available: boolean }, string>({
      query: (username) => `/user/check-username?username=${username}`,
    }),
    followUser: builder.mutation<{ success: boolean; followingCount: number }, string>({
      query: (userId) => ({
        url: `/user/${userId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: ['Profile', 'Feed'],
    }),
    unfollowUser: builder.mutation<{ success: boolean; followingCount: number }, string>({
      query: (userId) => ({
        url: `/user/${userId}/unfollow`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile', 'Feed'],
    }),
    getFollowers: builder.query<{ success: boolean; data: { items: any[]; total: number } }, { userId: string; page?: number; limit?: number }>({
      query: ({ userId, page = 1, limit = 20 }) => `/user/${userId}/followers?page=${page}&limit=${limit}`,
      transformResponse: (response: any) => {
        return {
          success: response.success,
          data: {
            items: response.followers || [],
            total: response.meta?.totalCount || 0
          }
        };
      },
    }),
    getFollowing: builder.query<{ success: boolean; data: { items: any[]; total: number } }, { userId: string; page?: number; limit?: number }>({
      query: ({ userId, page = 1, limit = 20 }) => `/user/${userId}/following?page=${page}&limit=${limit}`,
      transformResponse: (response: any) => {
        return {
          success: response.success,
          data: {
            items: response.following || [],
            total: response.meta?.totalCount || 0
          }
        };
      },
    }),
    isFollowing: builder.query<{ success: boolean; isFollowing: boolean }, string>({
      query: (userId) => `/user/${userId}/is-following`,
    }),
    changePassword: builder.mutation<{ success: boolean; message: string; token?: string }, { oldPassword: string; newPassword: string; confPassword: string }>({
      query: (body) => ({
        url: '/user/change-password',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetUserProfileByUsernameQuery,
  useGetSuggestedUsersQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useUpdateBannerMutation,
  useUpdateSocialLinksMutation,
  useGeneratePresignedUrlMutation,
  useCheckUsernameQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useIsFollowingQuery,
  useChangePasswordMutation,
} = userApi;
