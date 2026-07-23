'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { updateVideoProgress, clearVideoUpload } from '@/lib/features/post/videoUploadSlice';
import { postApi } from '@/lib/features/post/postApi';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:7682';

export default function VideoProgressTracker() {
  const dispatch = useAppDispatch();
  const { isProcessing, postId } = useAppSelector((state: any) => state.videoUpload);
  const { accessToken } = useAppSelector((state: any) => state.auth);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isProcessing || !postId || !accessToken) return;

    const socketInstance = io(SOCKET_URL, {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    const joinRoom = () => {
      socketInstance.emit('join_post_room', postId);
    };

    if (socketInstance.connected) {
      joinRoom();
    }

    socketInstance.on('connect', joinRoom);

    socketInstance.on('video_progress', (data: any) => {
      if (data.postId === postId) {
        dispatch(updateVideoProgress({ progress: data.progress, status: data.status }));
        
        if (data.status === 'completed') {
          setTimeout(() => {
            dispatch(clearVideoUpload());
            dispatch(postApi.util.invalidateTags(['Feed']));
            toast.success('Video processed and post published successfully!');
            socketInstance.disconnect();
          }, 2000); // 2 second delay to let user see 100%
        } else if (data.status === 'failed') {
          setTimeout(() => {
            dispatch(clearVideoUpload());
            toast.error('Video processing failed');
            socketInstance.disconnect();
          }, 2000);
        }
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [isProcessing, postId, accessToken, dispatch]);

  return null; // Hidden component
}
