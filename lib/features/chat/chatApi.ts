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
    sendMessage: builder.mutation<{ success: boolean; data: any }, { receiverId: string; content?: string; sharedPostId?: string; conversationId?: string }>({
      query: (body) => ({
        url: '/chat/message',
        method: 'POST',
        body,
      }),
      async onQueryStarted({ conversationId, content, sharedPostId }, { dispatch, queryFulfilled, getState }) {
        // Only optimistically update if we have a real conversationId
        if (!conversationId || conversationId.startsWith('new-')) return;

        const state = getState() as any;
        const senderId = state.auth?.user?.id;

        const tempId = `temp-${Date.now()}`;
        const newMessage = {
          id: tempId,
          conversationId,
          senderId,
          content: content || '',
          sharedPostId: sharedPostId || null,
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        // Optimistically add the message to cache
        const patchResult = dispatch(
          chatApi.util.updateQueryData('getMessages', conversationId, (draft) => {
            if (draft && Array.isArray(draft.data)) {
              draft.data.push(newMessage);
            }
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Replace temp message with real message from server
          dispatch(
            chatApi.util.updateQueryData('getMessages', conversationId, (draft) => {
              if (draft && Array.isArray(draft.data)) {
                const idx = draft.data.findIndex((m) => m.id === tempId);
                if (idx !== -1) {
                  draft.data[idx] = data.data;
                }
              }
            })
          );
          // Refresh conversations list to update last message preview
          dispatch(chatApi.util.invalidateTags([{ type: 'Chat' as const }]));
        } catch {
          patchResult.undo();
        }
      },
    }),
    getChatUnreadCount: builder.query<{ success: boolean; count: number }, void>({
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
    clearChat: builder.mutation<{ success: boolean; message: string }, string>({
      query: (conversationId) => ({
        url: `/chat/${conversationId}/clear`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetChatUnreadCountQuery,
  useMarkConversationAsReadMutation,
  useClearChatMutation,
} = chatApi;
