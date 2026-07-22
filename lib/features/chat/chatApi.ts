import { baseApi } from '../../services/api';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => '/chat/conversations',
      providesTags: ['Chat'],
    }),
    getMessages: builder.query<{ success: boolean; data: any[] }, string>({
      query: (conversationId) => `/chat/${conversationId}/messages`,
      providesTags: (_result, _err, id) => [{ type: 'Chat', id }],
    }),
    sendMessage: builder.mutation<{ success: boolean; data: any }, { receiverId: string; content?: string; sharedPostId?: string }>({
      query: (body) => ({
        url: '/chat/message',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
    getUnreadCount: builder.query<{ success: boolean; count: number }, void>({
      query: () => '/chat/unread-count',
      providesTags: ['Chat'],
    }),
    markConversationAsRead: builder.mutation<{ success: boolean; count: number }, string>({
      query: (conversationId) => ({
        url: `/chat/${conversationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetUnreadCountQuery,
  useMarkConversationAsReadMutation,
} = chatApi;
