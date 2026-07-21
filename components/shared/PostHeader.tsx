'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ShieldAlert, Link2, Trash2, Pencil, UserMinus, UserPlus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/lib/hooks';
import { timeAgo } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { toast } from 'sonner';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/lib/features/user/userApi';
import { useDeletePostMutation } from '@/lib/features/post/postApi';
import LoginRequiredDialog from './LoginRequiredDialog';
import { useRouter } from 'next/navigation';

interface PostHeaderProps {
  post: Post;
  onEditClick?: () => void;
}

export default function PostHeader({ post, onEditClick }: PostHeaderProps) {
  const router = useRouter();
  const author = post.author || post.user || {
    id: 'unknown',
    username: 'anonymous',
    avatarUrl: undefined,
    first_name: 'NexusPlay',
    last_name: 'User',
    isVerified: false,
  };

  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowingAuthor || post.isFollowing || false);
  const [followUser, { isLoading: isFollowingLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingLoading }] = useUnfollowUserMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(author.id).unwrap();
        setIsFollowing(false);
        toast.success(`Unfollowed @${author.username}`);
      } else {
        await followUser(author.id).unwrap();
        setIsFollowing(true);
        toast.success(`Followed @${author.username}`);
      }
    } catch {
      toast.error('Failed to update follow status');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Could not copy link'));
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    toast.success('Post reported successfully. Thank you for keeping our platform safe!');
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.id).unwrap();
      toast.success('Post deleted successfully');
      router.push('/');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const isPostOwner = post.isOwnPost || author.id === currentUser?.id || post.user?.id === currentUser?.id;
  const authorName = author.first_name
    ? `${author.first_name} ${author.last_name || ''}`.trim()
    : author.username;

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 border-b border-border/40 bg-card/10 backdrop-blur-md rounded-t-xl">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/profile/${author.username}`} className="shrink-0">
            <Avatar className="w-10 h-10 ring-2 ring-border/50 hover:ring-brand-medium transition-all duration-200">
              <AvatarImage src={author.avatarUrl} alt={author.username} />
              <AvatarFallback className="bg-gradient-to-tr from-brand-dark/20 to-brand-medium/20 text-brand-dark font-bold text-sm">
                {author.first_name?.[0] || author.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <Link href={`/profile/${author.username}`} className="text-sm font-bold hover:underline truncate text-foreground">
                {authorName}
              </Link>
              {author.isVerified && (
                <svg className="w-4 h-4 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Link href={`/profile/${author.username}`} className="hover:text-foreground transition-colors truncate">
                @{author.username}
              </Link>
              <span className="shrink-0">•</span>
              <span className="shrink-0">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPostOwner && (
            <Button
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              disabled={isFollowingLoading || isUnfollowingLoading}
              onClick={handleFollowToggle}
              className="h-8 px-3 rounded-full text-xs font-bold transition-all duration-200"
            >
              {isFollowingLoading || isUnfollowingLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserMinus className="w-3.5 h-3.5 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full shrink-0" />
              }
            >
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card/95 border-border/80 backdrop-blur-xl">
              <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
                <Link2 className="w-4 h-4" />
                Copy Link
              </DropdownMenuItem>
              {!isPostOwner && (
                <DropdownMenuItem onClick={handleReport} className="gap-2 cursor-pointer text-red-500 hover:text-red-500">
                  <ShieldAlert className="w-4 h-4" />
                  Report Post
                </DropdownMenuItem>
              )}
              {isPostOwner && (
                <>
                  {onEditClick && (
                    <DropdownMenuItem onClick={onEditClick} className="gap-2 cursor-pointer">
                      <Pencil className="w-4 h-4" />
                      Edit Post
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="gap-2 cursor-pointer text-red-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
