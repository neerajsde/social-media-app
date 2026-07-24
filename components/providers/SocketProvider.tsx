'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { notificationApi } from '@/lib/features/notification/notificationApi';
import { chatApi } from '@/lib/features/chat/chatApi';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7682/api/v1';
    // Remove /api/v1 to get the base socket URL
    const socketUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

    const socketInstance = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    // Listen for new notifications
    socketInstance.on('new_notification', () => {
      dispatch(notificationApi.util.invalidateTags(['NotificationCount', 'Notification']));
    });

    // Listen for new messages — inject into cache + invalidate conversations list
    socketInstance.on('new_message', (data: { userId: string; message: any }) => {
      console.log('[Socket] ✅ new_message received:', data);

      const msg = data?.message;
      if (msg && msg.conversationId) {
        // Try to inject the new message directly into the cached message list
        dispatch(
          chatApi.util.updateQueryData('getMessages', msg.conversationId, (draft) => {
            if (draft && Array.isArray(draft.data)) {
              const exists = draft.data.some((m) => m.id === msg.id);
              if (!exists) {
                draft.data.push(msg);
              }
            }
          })
        );
      }

      // Refresh conversations list to update last message + unread count
      dispatch(chatApi.util.invalidateTags(['Chat']));
    });

    // Listen for presence changes (online / offline)
    socketInstance.on('presence_change', (payload: { targetUserId: string; userId: string; presence: string; lastSeenAt?: string }) => {
      if (payload?.userId && payload?.presence) {
        dispatch(
          chatApi.util.updateQueryData('getConversations', undefined, (draft) => {
            if (draft?.data) {
              draft.data.forEach((conv) => {
                conv.participants.forEach((p: any) => {
                  if (p.id === payload.userId) {
                    p.presence = payload.presence;
                    if (payload.lastSeenAt) {
                      p.lastSeenAt = payload.lastSeenAt;
                    }
                  }
                });
              });
            }
          })
        );
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
