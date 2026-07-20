'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Repeat2,
  Eye,
  Play,
  Music,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/lib/hooks';
import { formatCount, timeAgo } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getMediaUrl } from '@/lib/media-url';
import AuthDialog from '@/components/shared/AuthDialog';
import { toast } from 'sonner';
import {
  useLikePostMutation,
  useDislikePostMutation,
  useBookmarkPostMutation,
  useRepostMutation,
  useSharePostExternallyMutation,
} from '@/lib/features/post/postApi';

interface PostCardProps {
  post: Post;
  showMedia?: boolean;
}

export default function PostCard({ post, showMedia = true }: PostCardProps) {
  const author = post.author ||
    post.user || {
      id: 'unknown',
      username: 'anonymous',
      avatarUrl: undefined,
      first_name: 'NexusPlay',
      last_name: 'User',
      isVerified: false,
    };

  const initialLikeCount = post.likesCount ?? (post as { likeCount?: number }).likeCount ?? 0;
  const commentsCount = post.commentsCount ?? (post as { commentCount?: number }).commentCount ?? 0;
  const sharesCount = post.sharesCount ?? (post as { shareCount?: number }).shareCount ?? 0;
  const viewsCount = post.viewsCount ?? (post as { viewCount?: number }).viewCount ?? 0;

  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);

  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [dislikePost, { isLoading: isDisliking }] = useDislikePostMutation();
  const [bookmarkPost, { isLoading: isBookmarking }] = useBookmarkPostMutation();
  const [repost, { isLoading: isReposting }] = useRepostMutation();
  const [shareExternally, { isLoading: isSharing }] = useSharePostExternallyMutation();

  const isActionLoading = isLiking || isDisliking || isBookmarking || isReposting || isSharing;

  const handleLike = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (isActionLoading) return;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      if (wasLiked) {
        await dislikePost(post.id).unwrap();
      } else {
        await likePost(post.id).unwrap();
      }
    } catch (err: unknown) {
      setLiked(wasLiked);
      setLikeCount(initialLikeCount);
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Could not update like';
      toast.error(message);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (bookmarked || isActionLoading) return;

    try {
      await bookmarkPost(post.id).unwrap();
      setBookmarked(true);
      toast.success('Post saved');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Could not bookmark post';
      toast.error(message);
    }
  };

  const handleRepost = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (isActionLoading) return;

    try {
      await repost({ postId: post.id, visibility: 'public' }).unwrap();
      toast.success('Post reposted');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Could not repost';
      toast.error(message);
    }
  };

 const handleShare = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const url = `${window.location.origin}/post/${post.id}`;

    try {
      await navigator.clipboard.writeText(url);
      await shareExternally(post.id).unwrap();
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleProtectedAction = (message: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    toast(message);
  };

  const isPostOwner =
    post.isOwnPost || author.id === currentUser?.id || post.user?.id === currentUser?.id;
  const authorName = author.first_name
    ? `${author.first_name} ${author.last_name || ''}`.trim()
    : author.username;

  const videoThumbnail = post.video?.thumbnail || post.thumbnailUrl;
  const showVideoMedia =
    (post.postType === 'video' || post.postType === 'reel') && Boolean(videoThumbnail);

  return (
    <>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 sm:p-5">
          {/* Author row */}
          <div className="flex items-start gap-2.5 sm:gap-3 mb-3">
            <Link href={`/profile/${author.username}`} className="shrink-0">
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 ring-1 ring-border hover:ring-brand-medium transition-all">
                <AvatarImage src={author.avatarUrl} alt={author.username} />
                <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-sm">
                  {author.first_name?.[0] || author.username?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Link
                  href={`/profile/${author.username}`}
                  className="text-sm font-semibold hover:underline truncate"
                >
                  {authorName}
                </Link>
                {author.isVerified && (
                  <svg
                    className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link href={`/profile/${author.username}`} className="hover:underline truncate">
                  @{author.username}
                </Link>
                <span className="shrink-0">·</span>
                <span className="shrink-0">{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 sm:w-9 sm:h-9 text-muted-foreground hover:text-foreground shrink-0"
                  />
                }
              >
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleProtectedAction('Post reported')}>
                  Report post
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>Copy link</DropdownMenuItem>
                {isPostOwner && (
                  <>
                    <DropdownMenuItem onClick={() => toast('Edit post coming soon')}>
                      Edit post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast('Delete post coming soon')}>
                      Delete post
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => handleProtectedAction('Marked as not interested')}
                >
                  Not interested
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {post.content && (
            <Link href={`/post/${post.id}`}>
              <p className="text-sm leading-relaxed mb-3 whitespace-pre-line hover:text-foreground/80 transition-colors break-words">
                {post.content}
              </p>
            </Link>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${tag}`}>
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal hover:bg-brand-dark/10 dark:hover:bg-brand-medium/20 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Images */}
          {showMedia && post.images && post.images.length > 0 && (
            <Link href={`/post/${post.id}`}>
              <div
                className={cn(
                  'rounded-xl overflow-hidden mb-3',
                  post.images.length === 1 && 'aspect-[16/10]',
                  post.images.length >= 2 && 'grid grid-cols-2 gap-0.5'
                )}
              >
                {post.images.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      'relative overflow-hidden bg-muted',
                      post.images!.length === 1 && 'aspect-[16/10]',
                      post.images!.length >= 2 && 'aspect-square'
                    )}
                  >
                    <img
                      src={getMediaUrl(img)}
                      alt={`Post image ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {i === 3 && post.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          +{post.images!.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Link>
          )}

          {/* Video / Reel thumbnail */}
          {showMedia && showVideoMedia && (
            <Link href={`/post/${post.id}`}>
              <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-muted">
                <img
                  src={getMediaUrl(videoThumbnail)}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  {post.postType === 'reel' ? (
                    <Music className="w-10 h-10 text-white drop-shadow-md" />
                  ) : (
                    <Play className="w-10 h-10 text-white fill-white drop-shadow-md" />
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-y-1 pt-1 -mx-1">
            <div className="flex flex-wrap items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading}
                className={cn(
                  'h-9 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs min-w-[44px] sm:min-w-0',
                  liked && 'text-red-500 hover:text-red-600'
                )}
                onClick={handleLike}
                aria-label={liked ? 'Unlike post' : 'Like post'}
              >
                {isLiking || isDisliking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
                )}
                <span className="tabular-nums">{formatCount(likeCount)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-9 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs text-muted-foreground hover:text-brand-dark dark:hover:text-brand-medium min-w-[44px] sm:min-w-0"
                nativeButton={false}
                render={<Link href={`/post/${post.id}`} />}
                aria-label="View comments"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="tabular-nums">{formatCount(commentsCount)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading}
                className="h-9 sm:h-8 px-2 sm:px-2.5 gap-1 sm:gap-1.5 text-xs text-muted-foreground min-w-[44px] sm:min-w-0"
                onClick={handleRepost}
                aria-label="Repost"
              >
                {isReposting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Repeat2 className="w-4 h-4" />
                )}
                <span className="tabular-nums hidden sm:inline">{formatCount(sharesCount)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading}
                className="h-9 sm:h-8 px-2 sm:px-2.5 text-xs text-muted-foreground min-w-[44px] sm:min-w-0"
                onClick={handleShare}
                aria-label="Share post"
              >
                {isSharing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
              <span className="text-xs text-muted-foreground flex items-center gap-1 px-1">
                <Eye className="w-3.5 h-3.5 shrink-0" />
                <span className="tabular-nums hidden sm:inline">{formatCount(viewsCount)}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading || bookmarked}
                className={cn(
                  'h-9 w-9 sm:h-8 sm:w-8 p-0',
                  bookmarked && 'text-brand-dark dark:text-brand-medium'
                )}
                onClick={handleBookmark}
                aria-label={bookmarked ? 'Saved' : 'Save post'}
              >
                {isBookmarking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
