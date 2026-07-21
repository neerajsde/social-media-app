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

interface PostCardProps {
  post: Post;
  showMedia?: boolean;
}

export default function PostCard({ post, showMedia = true }: PostCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
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

  return (
    <>
      <Card className="border-border/20 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <PostHeader post={post} />

          {/* Content & Tags */}
          <div className="p-3 sm:p-4 pb-2 space-y-2.5">
            {post.content && (
              <Link href={`/post/${post.id}`}>
                <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap hover:text-foreground transition-colors break-words pr-2">
                  {post.content}
                </p>
              </Link>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/search?q=${tag}`}>
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal cursor-pointer transition-colors bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground py-0.5 px-3 rounded-full border border-white/5"
                    >
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Media Player/Slideshow */}
          {showMedia && (
            <div className="px-3 sm:px-4 pb-2">
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

          {showCommentInput && (
            <div className="px-3 sm:px-4 pb-3">
              <CommentInput 
                onSubmit={handleCommentSubmit} 
                autoFocus 
                placeholder="Write a comment..." 
              />
            </div>
          )}
        </CardContent>
      </Card>

      <SharePostDialog postId={post.id} open={showShareDialog} onOpenChange={setShowShareDialog} />
      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
