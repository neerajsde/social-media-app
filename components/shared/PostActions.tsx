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
      <div className="flex flex-col gap-2.5 p-3 sm:p-4 border-t border-border/40 bg-card/5 backdrop-blur-md rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Like */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isActionLoading}
              onClick={handleLikeClick}
              className={cn(
                'w-9 h-9 rounded-full transition-transform hover:bg-red-500/10 active:scale-90',
                liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              {isLiking || isDisliking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={cn('w-5 h-5 transition-transform duration-200', liked && 'fill-current scale-110')} />
              )}
            </Button>

            {/* Comment */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCommentClick}
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-brand-medium/10 transition-colors"
              aria-label="Comment"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            {/* Repost */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isActionLoading || reposted}
              onClick={handleRepostToggle}
              className={cn(
                'w-9 h-9 rounded-full transition-colors',
                reposted ? 'text-brand-dark dark:text-brand-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
              aria-label="Repost"
            >
              {isReposting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Repeat2 className={cn('w-5 h-5', reposted && 'scale-110')} />
              )}
            </Button>

            {/* Share */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onShareClick}
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* View Count */}
            <span className="text-xs text-muted-foreground flex items-center gap-1 px-1">
              <Eye className="w-4 h-4 shrink-0" />
              <span className="tabular-nums font-medium">{formatCount(post.viewsCount ?? 0)} views</span>
            </span>

            {/* Bookmark */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isActionLoading}
              onClick={handleBookmarkClick}
              className={cn(
                'w-9 h-9 rounded-full transition-transform hover:bg-brand-dark/10 dark:hover:bg-brand-medium/10 active:scale-90',
                bookmarked ? 'text-brand-dark dark:text-brand-medium' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarking ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Bookmark className={cn('w-5 h-5', bookmarked && 'fill-current scale-110')} />
              )}
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        {(likeCount > 0 || (post.commentsCount ?? 0) > 0 || repostsCount > 0) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 text-xs font-semibold text-muted-foreground/90">
            {[
              likeCount > 0 && (
                <span key="likes" className="cursor-pointer hover:text-foreground transition-colors" onClick={handleLikeClick}>
                  <span className="text-foreground font-bold tabular-nums mr-0.5">{formatCount(likeCount)}</span> likes
                </span>
              ),
              (post.commentsCount ?? 0) > 0 && (
                <span key="comments" className="cursor-pointer hover:text-foreground transition-colors" onClick={onCommentClick}>
                  <span className="text-foreground font-bold tabular-nums mr-0.5">{formatCount(post.commentsCount ?? 0)}</span> comments
                </span>
              ),
              repostsCount > 0 && (
                <span key="shares">
                  <span className="text-foreground font-bold tabular-nums mr-0.5">{formatCount(repostsCount)}</span> shares
                </span>
              ),
            ]
              .filter(Boolean)
              .map((stat, i, arr) => (
                <div key={i} className="flex items-center gap-2">
                  {stat}
                  {i < arr.length - 1 && <span className="text-muted-foreground/50">•</span>}
                </div>
              ))}
          </div>
        )}
      </div>

      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
