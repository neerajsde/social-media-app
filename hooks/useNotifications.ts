import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector } from '../lib/hooks';
import {
  useGetNotificationsQuery,
  useGetNotificationUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  notificationApi,
  AppNotification
} from '../lib/features/notification/notificationApi';
import { useDispatch } from 'react-redux';
import { playNotificationSound } from '../lib/playSound';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:7682';

export const useNotifications = () => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [page, setPage] = useState(1);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Queries
  const { 
    data, 
    isLoading, 
    isFetching,
    refetch 
  } = useGetNotificationsQuery({ page }, { skip: !accessToken });

  const { data: countData, refetch: refetchCount } = useGetNotificationUnreadCountQuery(undefined, { skip: !accessToken });

  // Mutations
  const [markAsRead, { isLoading: isMarkingRead }] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] = useMarkAllAsReadMutation();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      refetchCount();
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetchCount();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const loadMore = useCallback(() => {
    if (!isFetching && data?.meta && page < data.meta.totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, data?.meta, page]);

  // Socket.IO Integration
  useEffect(() => {
    if (!accessToken || !user) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to notification socket');
    });

    socketInstance.on('new_notification', (newNotification: AppNotification) => {
      // Optimistically insert the new notification at the top of the cache
      dispatch(
        notificationApi.util.updateQueryData('getNotifications', { page: 1 }, (draft) => {
          draft.data.unshift(newNotification);
          draft.meta.total += 1;
        })
      );
      // Play sound
      playNotificationSound();
      // Update the unread count
      refetchCount();
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [accessToken, user, dispatch, refetchCount]);

  return {
    notifications: data?.data || [],
    unreadCount: countData?.count || 0,
    meta: data?.meta,
    isLoading,
    isFetching,
    isMarkingRead,
    isMarkingAllRead,
    loadMore,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refetch
  };
};
