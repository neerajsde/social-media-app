import { baseApi } from '../../services/api';

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string;
  postId?: string;
  commentId?: string;
  messageId?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatarUrl?: string;
  };
  post?: {
    id: string;
    postType: string;
    content?: string;
    images?: string[];
  };
}

export interface NotificationsResponse {
  success: boolean;
  data: AppNotification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => `/notification?page=${page}&limit=${limit}`,
      providesTags: ['Notification'],
      // Keep previous data when fetching next page
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      // Merge new pages into existing cache
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          return newItems;
        }
        currentCache.data.push(...newItems.data);
        currentCache.meta = newItems.meta;
      },
      // Refetch when page changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    getNotificationUnreadCount: builder.query<{ success: boolean; count: number }, void>({
      query: () => '/notification/unread-count',
      providesTags: ['NotificationCount'],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/notification/${id}/read`,
        method: 'PUT',
      }),
      // Optimistic update
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationApi.util.updateQueryData('getNotifications', {}, (draft) => {
            const notif = draft.data.find(n => n.id === id);
            if (notif) notif.isRead = true;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: `/notification/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification', 'NotificationCount'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
