'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
  const [mobileCommentsOpen, setMobileCommentsOpen] = useState(false);

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

  const handleCommentIconClick = () => {
    setMobileCommentsOpen(true);
  };

  const totalComments = commentsResponse?.total || post.commentsCount || commentsList.length || 0;
  const hasMoreComments = commentsList.length < totalComments;

  return (
    <>
      <div className="w-full flex flex-col">
        {/* Navigation header for Mobile */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href="/" aria-label="Back to feed">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-sm font-bold">Post Details</h1>
        </div>

        {/* Main responsive grid layout container */}
        <div className="w-full max-w-6xl mx-auto md:p-4 lg:p-6 flex flex-col md:flex-row gap-4 lg:gap-6 md:h-[calc(100vh-80px)]">
          
          {/* Left column: media player (Desktop & Mobile) */}
          <div className="flex-1 flex items-center justify-center bg-black/95 md:rounded-2xl overflow-hidden border border-border/30 shadow-2xl relative min-h-[300px] md:h-full">
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <PostMedia post={post} onDoubleLike={handleLikeToggle} />
            </div>
          </div>

          {/* Right column: interactive details sidebar (DESKTOP) */}
          <div className="hidden md:flex w-full md:w-[380px] lg:w-[440px] flex-col border border-border/50 bg-card/25 backdrop-blur-md rounded-2xl md:h-full overflow-hidden shadow-xl">
            {/* Post Header */}
            <PostHeader post={post} />

            {/* Scrollable details and comment feed */}
            <ScrollArea className="flex-1 px-4 py-3">
              <div className="space-y-4 pb-4">
                {/* Caption description */}
                <div className="space-y-2 px-1">
                  {post.content && (
                    <p className="text-sm leading-relaxed text-foreground/95 break-words whitespace-pre-wrap">
                      {post.content}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <Link key={tag} href={`/search?q=${tag}`} className="text-xs text-brand-medium hover:underline">
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-[1px] bg-border/40" />

                {/* Comment Section stream */}
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
            </ScrollArea>

            {/* Sticky Actions & Inputs at bottom */}
            <div className="border-t border-border/40 bg-card/30 backdrop-blur-md">
              <PostActions
                post={post}
                liked={liked}
                likeCount={likeCount}
                onLikeToggle={handleLikeToggle}
                bookmarked={bookmarked}
                onBookmarkToggle={handleBookmarkToggle}
                onCommentClick={() => {}}
                onShareClick={handleShareClick}
              />
              <div className="p-3">
                <CommentInput onSubmit={handleCommentSubmit} />
              </div>
            </div>
          </div>

          {/* Stacking widgets layout (MOBILE/TABLET only) */}
          <div className="md:hidden flex flex-col bg-card/10 border-t border-border/30 pb-20">
            {/* Header author details */}
            <PostHeader post={post} />

            {/* Caption & tags wrapper */}
            <div className="p-4 space-y-3">
              {post.content && (
                <p className="text-sm leading-relaxed text-foreground/95 break-words whitespace-pre-wrap">
                  {post.content}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${tag}`} className="text-xs text-brand-medium hover:underline">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Main actions row */}
            <PostActions
              post={post}
              liked={liked}
              likeCount={likeCount}
              onLikeToggle={handleLikeToggle}
              bookmarked={bookmarked}
              onBookmarkToggle={handleBookmarkToggle}
              onCommentClick={handleCommentIconClick}
              onShareClick={handleShareClick}
            />

            {/* Mobile Comment preview link shortcut bar */}
            <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleCommentIconClick}
                className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 p-0 hover:bg-transparent"
              >
                <MessageCircle className="w-4 h-4" />
                View all {totalComments} comments
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE Comments Bottom Sheet drawer */}
      <Sheet open={mobileCommentsOpen} onOpenChange={setMobileCommentsOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-card border-t border-border/80 h-[85vh] p-0 flex flex-col">
          <SheetHeader className="px-4 py-3 border-b border-border/40 shrink-0 text-left">
            <SheetTitle className="text-base font-bold">Comments</SheetTitle>
          </SheetHeader>

          {/* Independent scroll pane comments list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin">
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

          {/* Bottom fixed comment composer */}
          <div className="p-3 border-t border-border/40 bg-card/60 backdrop-blur-md pb-6 shrink-0">
            <CommentInput onSubmit={handleCommentSubmit} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Share dialogue & authorization protection modal */}
      <SharePostDialog postId={post.id} open={showShareDialog} onOpenChange={setShowShareDialog} />
      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
