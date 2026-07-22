'use client';

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, CheckCircle2, Heart, MessageCircle, UserPlus, Share2, Info, Mail } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';
import { AppNotification } from '@/lib/features/notification/notificationApi';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'like':
    case 'comment_like':
      return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
    case 'comment':
    case 'reply':
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case 'follow':
    case 'follow_request':
      return <UserPlus className="w-4 h-4 text-emerald-500" />;
    case 'share':
    case 'repost':
      return <Share2 className="w-4 h-4 text-purple-500" />;
    case 'message':
      return <Mail className="w-4 h-4 text-amber-500" />;
    default:
      return <Info className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationText = (notification: AppNotification) => {
  const actor = `@${notification.actor?.username || 'Someone'}`;
  switch (notification.type) {
    case 'like':
      return <span><span className="font-semibold text-primary">{actor}</span> liked your post</span>;
    case 'comment':
      return <span><span className="font-semibold text-primary">{actor}</span> commented on your post</span>;
    case 'follow':
      return <span><span className="font-semibold text-primary">{actor}</span> started following you</span>;
    case 'share':
      return <span><span className="font-semibold text-primary">{actor}</span> shared your post</span>;
    case 'message':
      return <span><span className="font-semibold text-primary">{actor}</span> sent you a message</span>;
    case 'mention':
      return <span><span className="font-semibold text-primary">{actor}</span> mentioned you in a post</span>;
    default:
      return <span><span className="font-semibold text-primary">{actor}</span> interacted with you</span>;
  }
};

const getNotificationLink = (notification: AppNotification) => {
  if (notification.postId) return `/post/${notification.postId}`;
  if (notification.type === 'follow' || notification.type === 'follow_request') return `/${notification.actor?.username || ''}`;
  if (notification.type === 'message' || notification.messageId) return `/chat`;
  return '#';
};

export const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    isFetching,
    loadMore, 
    markAsRead, 
    markAllAsRead,
    meta
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger className="relative flex items-center justify-center h-10 w-10 hover:bg-muted/50 rounded-full transition-colors focus-visible:outline-none">
        <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px] border-2 border-background animate-in zoom-in"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-[380px] p-0 shadow-2xl border-border/40 rounded-xl overflow-hidden backdrop-blur-xl bg-background/95">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                {unreadCount} new
              </Badge>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs font-medium text-muted-foreground hover:text-primary"
              onClick={() => markAllAsRead()}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-1 p-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs mt-1">When you get notifications, they'll show up here.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "group relative flex items-start gap-3 p-4 transition-all duration-200 hover:bg-muted/50 border-b border-border/20 last:border-0",
                    !notification.isRead && "bg-primary/5"
                  )}
                >
                  {!notification.isRead && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                  )}
                  
                  <Link href={`/${notification.actor?.username || ''}`} className="relative z-10 flex-shrink-0">
                    <Avatar className="w-10 h-10 border border-border/50">
                      <AvatarImage src={notification.actor?.avatarUrl} alt={notification.actor?.username || 'User'} />
                      <AvatarFallback>{(notification.actor?.username?.[0] || 'U').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={getNotificationLink(notification)}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                      className="block text-sm leading-tight text-foreground/90 hover:text-foreground transition-colors"
                    >
                      {getNotificationText(notification)}
                    </Link>
                    
                    <span className="text-[11px] text-muted-foreground mt-1.5 block font-medium">
                      {timeAgo(notification.createdAt)}
                    </span>
                  </div>

                  {!notification.isRead && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 transition-opacity absolute right-2 top-2"
                      onClick={() => markAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              
              {meta && meta.page < meta.totalPages && (
                <div className="p-4 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadMore}
                    disabled={isFetching}
                    className="w-full rounded-full border-border/50 hover:bg-muted/50"
                  >
                    {isFetching ? 'Loading...' : 'Load older notifications'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
