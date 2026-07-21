'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useAppSelector } from '@/lib/hooks';
import type { Post, Comment } from '@/lib/types';
import {
  useGetPostCommentsQuery,
  useCommentOnPostMutation,
  useLikePostMutation,
  useDislikePostMutation,
  useBookmarkPostMutation,
} from '@/lib/features/post/postApi';
import { toast } from 'sonner';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import CommentInput from './CommentInput';
import SharePostDialog from './SharePostDialog';
import LoginRequiredDialog from './LoginRequiredDialog';

interface SinglePostViewProps {
  post: Post;
}

export default function SinglePostView({ post }: SinglePostViewProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Post states
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);

  // Dialog/Sheet states
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Mutations/Queries
  const [likePost] = useLikePostMutation();
  const [dislikePost] = useDislikePostMutation();
  const [bookmarkPost] = useBookmarkPostMutation();
  const [commentOnPost] = useCommentOnPostMutation();

  const { data: commentsResponse, isLoading: isLoadingComments, isFetching: isFetchingComments } = useGetPostCommentsQuery({
    postId: post.id,
    page,
    limit: 10,
  });

  // Sync like/bookmark states if changed externally
  useEffect(() => {
    setLiked(post.isLiked || false);
    setLikeCount(post.likesCount || 0);
    setBookmarked(post.isBookmarked || false);
  }, [post]);

  // Merge loaded comments pages
  useEffect(() => {
    if (commentsResponse?.data) {
      const rawComments = commentsResponse.data as any;
      const normalized = Array.isArray(rawComments) ? rawComments : (rawComments.comments || []);
      if (page === 1) {
        setCommentsList(normalized);
      } else {
        setCommentsList((prev) => {
          const seen = new Set(prev.map((c) => c.id));
          const next = normalized.filter((c: any) => !seen.has(c.id));
          return [...prev, ...next];
        });
      }
    }
  }, [commentsResponse, page]);

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

  const handleCommentSubmit = async (content: string) => {
    try {
      await commentOnPost({ postId: post.id, content }).unwrap();
      setPage(1);
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleShareClick = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setShowShareDialog(true);
  };


  const totalComments = commentsResponse?.total || post.commentsCount || commentsList.length || 0;
  const hasMoreComments = commentsList.length < totalComments;

  return (
    <>
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen bg-background md:py-6">
        {/* Navigation header for Mobile */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href="/" aria-label="Back to feed">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-sm font-bold">Post Details</h1>
        </div>

        {/* Main Post Card Container */}
        <div className="flex flex-col bg-card border-x md:border border-border/20 md:rounded-2xl shadow-sm overflow-hidden mb-8">
          
          {/* Post Header */}
          <PostHeader post={post} />

          {/* Caption & tags */}
          <div className="px-4 pb-3 space-y-2">
            {post.content && (
              <p className="text-sm leading-relaxed text-foreground/95 break-words whitespace-pre-wrap">
                {post.content}
              </p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/search?q=${tag}`} className="text-xs text-[#05a85c] hover:underline font-medium">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Media Player */}
          <div className="w-full flex items-center justify-center bg-[#050505] border-y border-border/20 relative">
            <div className="w-full py-2">
              <PostMedia post={post} onDoubleLike={handleLikeToggle} />
            </div>
          </div>

          {/* Actions */}
          <PostActions
            post={post}
            liked={liked}
            likeCount={likeCount}
            onLikeToggle={handleLikeToggle}
            bookmarked={bookmarked}
            onBookmarkToggle={handleBookmarkToggle}
            onCommentClick={() => {
              const el = document.getElementById('comment-input');
              el?.focus();
            }}
            onShareClick={handleShareClick}
          />

          <div className="h-[1px] bg-border/20 w-full" />

          {/* Comments Section */}
          <div className="flex flex-col w-full">
            <div className="px-4 py-3 border-b border-border/10 bg-card/50">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Comments ({totalComments})
              </h3>
            </div>
            
            {/* Scrollable comments container - If content exceeds screen it will naturally scroll the page */}
            <div className="px-4 py-4 w-full bg-card/30">
              <CommentSection
                comments={commentsList}
                postId={post.id}
                isLoading={isLoadingComments}
                isFetching={isFetchingComments}
                totalComments={totalComments}
                onLoadMore={() => setPage((p) => p + 1)}
                hasMore={hasMoreComments}
              />
            </div>

            {/* Comment Input */}
            <div className="sticky bottom-0 p-3 border-t border-border/20 bg-card/95 backdrop-blur-md">
              <div id="comment-input-container">
                <CommentInput onSubmit={handleCommentSubmit} autoFocus={false} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <SharePostDialog postId={post.id} open={showShareDialog} onOpenChange={setShowShareDialog} />
      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
