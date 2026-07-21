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
      <div className="flex flex-col border-t border-border/20">
        {/* Stats Summary - on top */}
        {(likeCount > 0 || (post.commentsCount ?? 0) > 0 || repostsCount > 0) && (
          <div className="flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border/10">
            <div className="flex items-center gap-1">
              <span className="text-sm">👍</span>
              <span className="ml-1 font-semibold text-foreground/80">{formatCount(likeCount)}</span>
            </div>
            <div className="flex items-center gap-3">
              {(post.commentsCount ?? 0) > 0 && (
                <span className="cursor-pointer hover:text-foreground transition-colors" onClick={onCommentClick}>
                  {formatCount(post.commentsCount ?? 0)} Comments
                </span>
              )}
              {repostsCount > 0 && (
                <span>
                  {formatCount(repostsCount)} Shares
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Row - at bottom */}
        <div className="flex items-center justify-between px-2 py-1">
          {/* Like */}
          <Button
            type="button"
            variant="ghost"
            disabled={isActionLoading}
            onClick={handleLikeClick}
            className={cn(
              'flex-1 flex gap-2 items-center justify-center rounded-lg py-2 hover:bg-white/5 transition-colors',
              liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            {isLiking || isDisliking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Heart className={cn('w-5 h-5 transition-transform duration-200', liked && 'fill-current')} />
            )}
            <span className="hidden sm:inline font-semibold">Like</span>
          </Button>

          {/* Comment */}
          <Button
            type="button"
            variant="ghost"
            onClick={onCommentClick}
            className="flex-1 flex gap-2 items-center justify-center rounded-lg py-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Comment"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">Comment</span>
          </Button>

          {/* Share */}
          <Button
            type="button"
            variant="ghost"
            onClick={onShareClick}
            className="flex-1 flex gap-2 items-center justify-center rounded-lg py-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Share"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline font-semibold">Share</span>
          </Button>

          {/* Bookmark */}
          <Button
            type="button"
            variant="ghost"
            disabled={isActionLoading}
            onClick={handleBookmarkClick}
            className={cn(
              'flex-1 flex gap-2 items-center justify-center rounded-lg py-2 hover:bg-white/5 transition-colors',
              bookmarked ? 'text-brand-dark dark:text-brand-medium' : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            {isBookmarking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bookmark className={cn('w-5 h-5', bookmarked && 'fill-current')} />
            )}
            <span className="hidden sm:inline font-semibold">Save</span>
          </Button>
        </div>
      </div>

      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
