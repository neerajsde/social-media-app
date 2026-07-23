'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  const hasMedia = (post.images && post.images.length > 0) || post.video || post.mediaUrl || post.thumbnailUrl;

  return (
    <>
      <div className="w-full max-w-3xl mx-auto flex flex-col min-h-screen bg-transparent md:py-8">
        {/* Navigation header for Mobile */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-2xl md:hidden">
          <Link href="/" aria-label="Back to feed">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10 active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white">Post Details</h1>
        </div>

        {/* Main Post Card Container */}
        <div className="flex flex-col bg-[#0a0a0a] md:bg-[#111111] md:border border-white/10 md:rounded-[2rem] shadow-2xl overflow-hidden md:mb-8 ring-1 ring-white/5 md:ring-0">
          
          {/* Post Header */}
          <div className="pt-2 md:pt-4 px-2 md:px-4">
            <PostHeader post={post} />
          </div>

          {/* Caption & tags */}
          <div className="px-5 md:px-8 pb-5 space-y-3 mt-1">
            {post.content && (
              <div className="text-[15px] sm:text-[17px] leading-[1.6] text-white/90 break-words font-normal">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({node, ...props}) => <a className="text-[#05a85c] hover:text-[#06c26a] hover:underline font-medium transition-colors" {...props} />,
                    p: ({node, ...props}) => <p className="whitespace-pre-wrap mb-3 last:mb-0" {...props} />
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/search?q=${tag}`} className="text-[14px] px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors font-medium">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Media Player */}
          {hasMedia && (
            <div className="w-full flex items-center justify-center bg-black/50 border-y border-white/5 relative mt-2">
              <div className="w-full relative">
                <PostMedia post={post} onDoubleLike={handleLikeToggle} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-2 md:px-4 py-1">
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
          </div>

          <div className="h-[1px] bg-white/10 w-full" />

          {/* Comments Section */}
          <div className="flex flex-col w-full bg-[#0a0a0a] md:bg-transparent">
            <div className="px-6 py-5 border-b border-white/5">
              <h3 className="text-[13px] font-bold text-white/60 uppercase tracking-[0.15em]">
                Comments <span className="ml-1 text-white/40 font-medium">({totalComments})</span>
              </h3>
            </div>
            
            {/* Scrollable comments container */}
            <div className="px-4 sm:px-6 py-6 w-full min-h-[300px]">
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
            <div className="sticky bottom-0 p-4 sm:p-6 border-t border-white/10 bg-[#0a0a0a]/95 md:bg-[#111111]/95 backdrop-blur-2xl">
              <div id="comment-input-container" className="max-w-2xl mx-auto">
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
