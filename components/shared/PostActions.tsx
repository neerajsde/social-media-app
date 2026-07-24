'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Repeat2, Share2, Bookmark, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/hooks';
import { formatCount } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { toast } from 'sonner';
import {
  useLikePostMutation,
  useDislikePostMutation,
  useBookmarkPostMutation,
  useRepostMutation,
  useSharePostExternallyMutation,
} from '@/lib/features/post/postApi';
import LoginRequiredDialog from './LoginRequiredDialog';

interface PostActionsProps {
  post: Post;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  // Controlled props
  liked?: boolean;
  likeCount?: number;
  onLikeToggle?: () => void;
  bookmarked?: boolean;
  onBookmarkToggle?: () => void;
}

export default function PostActions({
  post,
  onCommentClick,
  onShareClick,
  liked: controlledLiked,
  likeCount: controlledLikeCount,
  onLikeToggle,
  bookmarked: controlledBookmarked,
  onBookmarkToggle,
}: PostActionsProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const [internalLiked, setInternalLiked] = useState(post.isLiked || false);
  const [internalLikeCount, setInternalLikeCount] = useState(post.likesCount || 0);
  const [internalBookmarked, setInternalBookmarked] = useState(post.isBookmarked || false);
  const [reposted, setReposted] = useState(post.isReposted || false);
  const [repostsCount, setRepostsCount] = useState(post.sharesCount || 0);

  useEffect(() => {
    setInternalLiked(post.isLiked || false);
    setInternalLikeCount(post.likesCount || 0);
    setInternalBookmarked(post.isBookmarked || false);
    setReposted(post.isReposted || false);
    setRepostsCount(post.sharesCount || 0);
  }, [post.isLiked, post.likesCount, post.isBookmarked, post.isReposted, post.sharesCount]);

  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [dislikePost, { isLoading: isDisliking }] = useDislikePostMutation();
  const [bookmarkPost, { isLoading: isBookmarking }] = useBookmarkPostMutation();
  const [repost, { isLoading: isReposting }] = useRepostMutation();
  const [shareExternally, { isLoading: isSharing }] = useSharePostExternallyMutation();

  const isActionLoading = isLiking || isDisliking || isBookmarking || isReposting || isSharing;

  const isControlledLike = controlledLiked !== undefined;
  const liked = isControlledLike ? controlledLiked : internalLiked;
  const likeCount = controlledLikeCount !== undefined ? controlledLikeCount : internalLikeCount;

  const isControlledBookmark = controlledBookmarked !== undefined;
  const bookmarked = isControlledBookmark ? controlledBookmarked : internalBookmarked;

  const handleLikeClick = async () => {
    if (onLikeToggle) {
      onLikeToggle();
      return;
    }

    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const wasLiked = liked;
    const previousLikeCount = likeCount;

    setInternalLiked(!wasLiked);
    setInternalLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      if (wasLiked) {
        await dislikePost(post.id).unwrap();
        toast.success('Post unliked');
      } else {
        await likePost(post.id).unwrap();
        toast.success('Post liked');
      }
    } catch {
      setInternalLiked(wasLiked);
      setInternalLikeCount(previousLikeCount);
      toast.error('Failed to update like status');
    }
  };

  const handleBookmarkClick = async () => {
    if (onBookmarkToggle) {
      onBookmarkToggle();
      return;
    }

    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const wasBookmarked = bookmarked;
    setInternalBookmarked(!wasBookmarked);

    try {
      await bookmarkPost(post.id).unwrap();
      toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch {
      setInternalBookmarked(wasBookmarked);
      toast.error('Failed to update bookmark status');
    }
  };

  const handleRepostToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    try {
      await repost({ postId: post.id, visibility: 'public' }).unwrap();
      setReposted(true);
      setRepostsCount((c) => c + 1);
      toast.success('Post reposted successfully');
    } catch (err: any) {
      const message = err?.data?.message || 'Failed to repost';
      toast.error(message);
    }
  };

  return (
    <>
      <div className="flex flex-col pt-1 pb-2">
        {/* Action Row */}
        <div className="flex items-center justify-between px-4 py-1">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              type="button"
              disabled={isActionLoading}
              onClick={handleLikeClick}
              className={cn(
                'transition-colors hover:opacity-70',
                liked ? 'text-red-500' : 'text-foreground'
              )}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              {isLiking || isDisliking ? (
                <Loader2 className="w-[26px] h-[26px] animate-spin text-muted-foreground" />
              ) : (
                <Heart className={cn('w-[26px] h-[26px] transition-transform duration-200', liked && 'fill-current')} />
              )}
            </button>

            {/* Comment */}
            <button
              type="button"
              onClick={onCommentClick}
              className="text-foreground transition-colors hover:opacity-70"
              aria-label="Comment"
            >
              <MessageCircle className="w-[26px] h-[26px]" />
            </button>

            {/* Repost */}
            <button
              type="button"
              disabled={isActionLoading}
              onClick={handleRepostToggle}
              className={cn(
                'transition-colors hover:opacity-70',
                reposted ? 'text-green-500' : 'text-foreground'
              )}
              aria-label="Repost"
            >
              {isReposting ? (
                <Loader2 className="w-[26px] h-[26px] animate-spin text-muted-foreground" />
              ) : (
                <Repeat2 className="w-[26px] h-[26px]" />
              )}
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={onShareClick}
              className="text-foreground transition-colors hover:opacity-70"
              aria-label="Share"
            >
              <Share2 className="w-[26px] h-[26px]" />
            </button>
          </div>

          <div className="flex items-center">
            {/* Bookmark */}
            <button
              type="button"
              disabled={isActionLoading}
              onClick={handleBookmarkClick}
              className={cn(
                'transition-colors hover:opacity-70',
                bookmarked ? 'text-foreground' : 'text-foreground'
              )}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarking ? (
                <Loader2 className="w-[26px] h-[26px] animate-spin text-muted-foreground" />
              ) : (
                <Bookmark className={cn('w-[26px] h-[26px]', bookmarked && 'fill-current')} />
              )}
            </button>
          </div>
        </div>

        {/* Stats Summary - likes count below actions */}
        {(likeCount > 0 || repostsCount > 0) && (
          <div className="px-4 mt-1.5 flex flex-col gap-1 text-sm">
            {likeCount > 0 && (
              <span className="font-semibold text-foreground">
                {formatCount(likeCount)} {likeCount === 1 ? 'like' : 'likes'}
              </span>
            )}
          </div>
        )}
      </div>



      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
