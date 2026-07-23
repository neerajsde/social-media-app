'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/lib/features/user/userApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserListCardProps {
  user: {
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
    avatarUrl?: string;
    isVerified?: boolean;
    isFollowing?: boolean;
    followsYou?: boolean;
  };
}

export default function UserListCard({ user }: UserListCardProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isCurrentUser = currentUser?.id === user.id;

  const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation();
  
  // Local state for optimistic UI
  const [isFollowingState, setIsFollowingState] = useState(!!user.isFollowing);

  const fullName = user.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim() 
    : user.username;

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrentUser) return;

    try {
      if (isFollowingState) {
        setIsFollowingState(false);
        await unfollowUser(user.id).unwrap();
        toast.success(`Unfollowed @${user.username}`);
      } else {
        setIsFollowingState(true);
        await followUser(user.id).unwrap();
        toast.success(`Followed @${user.username}`);
      }
    } catch (err) {
      // Rollback
      setIsFollowingState(!!user.isFollowing);
      toast.error('Failed to update follow status');
    }
  };

  const isLoading = isFollowingLoading || isUnfollowingLoading;

  return (
    <Link href={`/profile/${user.username}`}>
      <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.02] rounded-2xl transition-colors gap-3 cursor-pointer group border border-transparent hover:border-white/5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-12 h-12 border border-white/10 group-hover:border-brand-medium/50 transition-colors">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-brand-medium/20 text-brand-dark font-bold">
              {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate text-sm sm:text-base">
                {fullName}
              </span>
              {user.isVerified && (
                <svg className="w-4 h-4 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground truncate">
              @{user.username}
            </span>
          </div>
        </div>

        {!isCurrentUser && currentUser && (
          <Button
            size="sm"
            onClick={handleFollowToggle}
            disabled={isLoading}
            variant={isFollowingState ? 'outline' : 'default'}
            className={cn(
              "h-8 sm:h-9 px-4 sm:px-5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 min-w-[90px]",
              isFollowingState
                ? "bg-transparent border-white/20 hover:border-white/40 hover:bg-white/5 text-foreground"
                : "bg-brand-dark hover:bg-brand-medium text-white border-none"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowingState ? (
              'Following'
            ) : user.followsYou ? (
              'Follow Back'
            ) : (
              'Follow'
            )}
          </Button>
        )}
      </div>
    </Link>
  );
}
