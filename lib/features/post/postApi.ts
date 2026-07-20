import { baseApi } from '../../services/api';
import type { Post, Comment, CreatePostRequest, FeedResponse } from '../../types';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<FeedResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/post/feed?page=${page}&limit=${limit}`,
      providesTags: ['Feed'],
    }),
    getPost: builder.query<{ success: boolean; data: Post }, string>({
      query: (postId) => `/post/${postId}`,
      providesTags: (_result, _err, id) => [{ type: 'Post', id }],
    }),
    getPostComments: builder.query<{ success: boolean; data: Comment[]; total: number }, { postId: string; page?: number; limit?: number }>({
      query: ({ postId, page = 1, limit = 10 }) => `/post/${postId}/comments?page=${page}&limit=${limit}`,
      providesTags: (_result, _err, { postId }) => [{ type: 'Comments', id: postId }],
    }),
    createPost: builder.mutation<{ success: boolean; data: Post }, CreatePostRequest>({
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
      invalidatesTags: (_result, _err, id) => [{ type: 'Post', id }],
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
    }),
    repost: builder.mutation<{ success: boolean }, { postId: string; content?: string; visibility: string }>({
      query: (body) => ({
        url: '/post/repost',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Feed'],
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
  useGetPostQuery,
  useGetPostCommentsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useDislikePostMutation,
  useBookmarkPostMutation,
  useCommentOnPostMutation,
  useReplyToCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useRepostMutation,
  useGeneratePostPresignedUrlMutation,
} = postApi;
