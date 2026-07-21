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
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatApi;
