'use client';

import { useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, CornerUpLeft, Award, Settings, CheckCheck, Trash2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { useNotifications } from '@/hooks/useNotifications';
import { AppNotification } from '@/lib/features/notification/notificationApi';

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    isLoading 
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'share':
        return <CornerUpLeft className="w-5 h-5 text-orange-500" />;
      case 'new_post':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-brand-medium" />;
    }
  };

  const getNotificationText = (notification: AppNotification) => {
    switch (notification.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      case 'share': return 'shared your post';
      case 'message': return 'sent you a message';
      case 'mention': return 'mentioned you in a post';
      case 'new_post': return 'created a new post';
      default: return 'interacted with you';
    }
  };

  const getNotificationLink = (notification: AppNotification) => {
    if (notification.postId) return `/post/${notification.postId}`;
    if (notification.type === 'follow' || notification.type === 'follow_request') return `/profile/${notification.actor?.username || ''}`;
    if (notification.type === 'message' || notification.messageId) return `/chat`;
    return '#';
  };

  return (
    <div className="w-full max-w-2xl border-r border-border/40 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button variant="ghost" size="icon" onClick={() => markAllAsRead()} title="Mark all as read" className="w-8 h-8 text-muted-foreground hover:text-foreground">
              <CheckCheck className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card 
              key={notif.id} 
              className={`border-border/50 transition-all hover:bg-muted/50 cursor-pointer ${notif.isRead ? 'bg-card/40' : 'bg-brand-medium/5 border-l-4 border-l-brand-dark dark:border-l-brand-medium'}`}
              onClick={() => {
                if (!notif.isRead) markAsRead(notif.id);
                // Also navigate if not clicking an inner link
              }}
            >
              <CardContent className="p-4 flex items-start gap-4 relative">
                {/* Invisible link overlay to make the whole card clickable while keeping inner links working */}
                <Link 
                  href={getNotificationLink(notif)} 
                  className="absolute inset-0 z-0" 
                  aria-label="View notification details"
                />
                
                <div className="mt-1 shrink-0 relative z-10">{getIcon(notif.type)}</div>
                <div className="flex-1 min-w-0 space-y-1 relative z-10">
                  <div className="flex items-start gap-2 justify-between">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${notif.actor?.username || ''}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={notif.actor?.avatarUrl} alt={notif.actor?.username || 'User'} />
                          <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs">{notif.actor?.first_name?.[0] || notif.actor?.username?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="text-sm">
                        <Link href={`/profile/${notif.actor?.username || ''}`} className="font-semibold hover:underline">
                          {notif.actor?.first_name || ''} {notif.actor?.last_name || ''}
                        </Link>{' '}
                        <span className="text-muted-foreground">{getNotificationText(notif)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                  </div>

                  {notif.postId && (
                    <div className="block mt-2 text-xs text-brand-dark dark:text-brand-medium font-medium hover:underline bg-muted/30 p-2 rounded-lg border border-border/20 w-fit pointer-events-none">
                      View associated post details
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 space-y-3">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-lg font-medium text-muted-foreground">All caught up!</p>
            <p className="text-sm text-muted-foreground">No new notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
