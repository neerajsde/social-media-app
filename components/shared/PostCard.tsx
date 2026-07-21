'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppSelector } from '@/lib/hooks';
import type { Post } from '@/lib/types';
import { useLikePostMutation, useDislikePostMutation, useBookmarkPostMutation, useCommentOnPostMutation } from '@/lib/features/post/postApi';
import { toast } from 'sonner';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import SharePostDialog from './SharePostDialog';
import LoginRequiredDialog from './LoginRequiredDialog';
import CommentInput from './CommentInput';
import { useRouter } from 'next/navigation';
import PostCommentsSheet from './PostCommentsSheet';

interface PostCardProps {
  post: Post;
  showMedia?: boolean;
}

export default function PostCard({ post, showMedia = true }: PostCardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);

  // Sync state if post prop updates (e.g. after auth hydration refetch)
  useEffect(() => {
    setLiked(post.isLiked || false);
    setLikeCount(post.likesCount || 0);
    setBookmarked(post.isBookmarked || false);
  }, [post.isLiked, post.likesCount, post.isBookmarked]);
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showCommentsSheet, setShowCommentsSheet] = useState(false);
  const [localComments, setLocalComments] = useState<{ id: string; username: string; content: string }[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [likePost] = useLikePostMutation();
  const [dislikePost] = useDislikePostMutation();
  const [bookmarkPost] = useBookmarkPostMutation();
  const [commentOnPost] = useCommentOnPostMutation();

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const wasLiked = liked;
    const previousLikeCount = likeCount;

    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      if (wasLiked) {
        await dislikePost(post.id).unwrap();
        toast.success('Post unliked');
      } else {
        await likePost(post.id).unwrap();
        toast.success('Post liked');
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount(previousLikeCount);
      toast.error('Failed to update like status');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    try {
      await bookmarkPost(post.id).unwrap();
      toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch {
      setBookmarked(wasBookmarked);
      toast.error('Failed to update bookmark status');
    }
  };

  const handleCommentClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowCommentInput((prev) => !prev);
  };

  const handleCommentSubmit = async (content: string) => {
    try {
      await commentOnPost({ postId: post.id, content }).unwrap();
      toast.success('Comment posted');
      
      // Optimistic UI update for the new comment
      setLocalComments((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          username: user?.username || 'you',
          content,
        },
      ]);
      setCommentsCount((prev) => prev + 1);
      
      setShowCommentInput(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to post comment');
    }
  };

  const handleShareClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowShareDialog(true);
  };

  const hasMedia = (post.images && post.images.length > 0) || post.video || post.mediaUrl || post.thumbnailUrl;
  const actuallyShowMedia = showMedia && hasMedia;

  return (
    <>
      <Card className="border-border/20 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <PostHeader post={post} />

          {/* Content if NO Media */}
          {!actuallyShowMedia && (
            <div className="px-4 py-3 space-y-2">
              {post.content && (
                <Link href={`/post/${post.id}`}>
                  <p className="text-[15px] sm:text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </Link>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${tag}`}>
                      <span className="text-[14px] text-brand-dark dark:text-brand-medium hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media Player/Slideshow */}
          {actuallyShowMedia && (
            <div className="w-full">
              <PostMedia post={post} onDoubleLike={handleLikeToggle} />
            </div>
          )}

          {/* Action Row */}
          <PostActions
            post={post}
            liked={liked}
            likeCount={likeCount}
            onLikeToggle={handleLikeToggle}
            bookmarked={bookmarked}
            onBookmarkToggle={handleBookmarkToggle}
            onCommentClick={handleCommentClick}
            onShareClick={handleShareClick}
          />

          {/* Content if HAS Media */}
          {actuallyShowMedia && (
            <div className="px-4 pb-2 space-y-1 mt-1">
              {post.content && (
                <Link href={`/post/${post.id}`}>
                  <p className="text-[14px] leading-relaxed text-foreground whitespace-pre-wrap break-words">
                    <span className="font-semibold mr-1.5 hover:underline cursor-pointer">
                      {post.author?.username || post.user?.username || 'anonymous'}
                    </span>
                    {post.content}
                  </p>
                </Link>
              )}

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${tag}`}>
                      <span className="text-[14px] text-brand-dark dark:text-brand-medium hover:underline cursor-pointer">
                        #{tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View All Comments & Local Comments */}
          <div className="px-4 pb-1 space-y-1">
            {commentsCount > 0 && (
              <button
                onClick={() => setShowCommentsSheet(true)}
                className="text-[14px] text-muted-foreground hover:text-foreground cursor-pointer border-none bg-transparent p-0"
              >
                View all {commentsCount} comments
              </button>
            )}
            {localComments.map((comment) => (
              <div key={comment.id} className="text-[14px] leading-relaxed text-foreground break-words">
                <span className="font-semibold mr-1.5">{comment.username}</span>
                <span>{comment.content}</span>
              </div>
            ))}
          </div>

          {showCommentInput && (
            <div className="px-4 pb-3 pt-2">
              <CommentInput 
                onSubmit={handleCommentSubmit} 
                autoFocus 
                placeholder="Add a comment..." 
              />
            </div>
          )}
        </CardContent>
      </Card>

      <SharePostDialog postId={post.id} open={showShareDialog} onOpenChange={setShowShareDialog} />
      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <PostCommentsSheet postId={post.id} open={showCommentsSheet} onOpenChange={setShowCommentsSheet} />
    </>
  );
}
