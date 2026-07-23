import { baseApi } from '../../services/api';
import type { Post, Comment, CreatePostRequest, FeedResponse, FeedType } from '../../types';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<FeedResponse, { page?: number; limit?: number; type?: FeedType }>({
      query: ({ page = 1, limit = 10, type = 'foryou' }) =>
        `/post/feed?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Feed' as const, id })),
              { type: 'Feed', id: 'LIST' },
            ]
          : [{ type: 'Feed', id: 'LIST' }],
    }),
    getReels: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/post/feed?page=${page}&limit=${limit}&type=reels`,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }: { id: string }) => ({ type: 'Feed' as const, id })),
              { type: 'Feed', id: 'REELS_LIST' },
            ]
          : [{ type: 'Feed', id: 'REELS_LIST' }],
    }),
    getUserPosts: builder.query<{ success: boolean; posts: Post[]; meta: any }, { userId: string; page?: number; limit?: number }>({
      query: ({ userId, page = 1, limit = 20 }) => `/post/user/${userId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { userId }) => ['Feed', { type: 'Feed', id: `User-${userId}` }],
    }),
    getBookmarkedPosts: builder.query<{ success: boolean; posts: Post[]; meta: any }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/post/bookmarks?page=${page}&limit=${limit}`,
      providesTags: ['Post', { type: 'Post', id: 'LIST_BOOKMARKS' }],
    }),
    getTrendingTags: builder.query<{ success: boolean; tags: { tag: string; postCount: number }[] }, { limit?: number }>({
      query: ({ limit = 5 }) => `/post/trending-tags?limit=${limit}`,
    }),
    getPost: builder.query<{ success: boolean; data: Post }, string>({
      query: (postId) => `/post/${postId}`,
      providesTags: (_result, _err, id) => [{ type: 'Post', id }],
    }),
    getPostComments: builder.query<{ success: boolean; data: Comment[]; total: number }, { postId: string; page?: number; limit?: number }>({
      query: ({ postId, page = 1, limit = 10 }) => `/post/${postId}/comments?page=${page}&limit=${limit}`,
      providesTags: (_result, _err, { postId }) => [{ type: 'Comments', id: postId }],
    }),
    getCommentReplies: builder.query<{ success: boolean; data: Comment[]; total: number }, { commentId: string; page?: number; limit?: number }>({
      query: ({ commentId, page = 1, limit = 10 }) => `/post/comment/${commentId}/replies?page=${page}&limit=${limit}`,
      providesTags: (_result, _err, { commentId }) => [{ type: 'Replies', id: commentId }],
    }),
    createPost: builder.mutation<{ success: boolean; data?: Post; postId?: string }, CreatePostRequest>({
      query: (body) => ({
        url: '/post/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Feed'],
    }),
    updatePost: builder.mutation<{ success: boolean }, { postId: string; content?: string; visibility: string; status: string }>({
      query: (body) => ({
        url: '/post/update',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Feed', 'Post'],
    }),
    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/post/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feed'],
    }),
    likePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/post/like/${postId}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Post', id }, 'Feed'],
    }),
    dislikePost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/post/dislike/${postId}`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Post', id }, 'Feed'],
    }),
    bookmarkPost: builder.mutation<{ success: boolean }, string>({
      query: (postId) => ({
        url: `/post/bookmark/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Post', id }, { type: 'Post', id: 'LIST_BOOKMARKS' }],
    }),
    commentOnPost: builder.mutation<{ success: boolean }, { postId: string; content: string; imageKey?: string }>({
      query: (body) => ({
        url: '/post/comment',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, { postId }) => [{ type: 'Comments', id: postId }, { type: 'Post', id: postId }, 'Feed'],
    }),
    replyToComment: builder.mutation<{ success: boolean }, { commentId: string; content: string }>({
      query: (body) => ({
        url: '/post/comment/reply',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Comments'],
    }),
    editComment: builder.mutation<{ success: boolean }, { commentId: string; content: string }>({
      query: (body) => ({
        url: '/post/comment',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Comments'],
    }),
    deleteComment: builder.mutation<{ success: boolean }, { postId: string; commentId: string }>({
      query: ({ postId, commentId }) => ({
        url: `/post/comment/${postId}/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments', 'Feed'],
    }),
    likeComment: builder.mutation<{ success: boolean }, { commentId: string; postId: string }>({
      query: ({ commentId, postId }) => ({
        url: `/post/like-unlike-comment/${commentId}/${postId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Comments'],
    }),
    repost: builder.mutation<{ success: boolean; message: string }, { postId: string; content?: string; visibility: string }>({
      query: (body) => ({
        url: '/post/repost',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Feed'],
    }),
    sharePostInApp: builder.mutation<{ success: boolean }, { postId: string; receiverId: string }>({
      query: ({ postId, receiverId }) => ({
        url: `/post/share-post-in-app/${postId}/${receiverId}`,
        method: 'POST',
      }),
    }),
    sharePostExternally: builder.mutation<{ success: boolean; message: string }, string>({
      query: (postId) => ({
        url: `/post/share-post-externally/${postId}`,
        method: 'POST',
      }),
    }),
    generatePostPresignedUrl: builder.mutation<{ success: boolean; data: any }, { postType: string; mimeTypes: string | string[] }>({
      query: (body) => ({
        url: '/post/presigned-url',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetReelsQuery,
  useGetUserPostsQuery,
  useGetBookmarkedPostsQuery,
  useGetTrendingTagsQuery,
  useGetPostQuery,
  useGetPostCommentsQuery,
  useGetCommentRepliesQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useDislikePostMutation,
  useBookmarkPostMutation,
  useCommentOnPostMutation,
  useReplyToCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useRepostMutation,
  useSharePostInAppMutation,
  useSharePostExternallyMutation,
  useGeneratePostPresignedUrlMutation,
} = postApi;
