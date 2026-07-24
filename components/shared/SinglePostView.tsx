'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Eye, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MarkdownRenderer from './MarkdownRenderer';

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
import { timeAgo } from '@/lib/mock-data';
import PostHeader from './PostHeader';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import CommentInput from './CommentInput';
import SharePostDialog from './SharePostDialog';
import LoginRequiredDialog from './LoginRequiredDialog';
import EditPostDialog from './EditPostDialog';

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
  const [showEditDialog, setShowEditDialog] = useState(false);

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

  // Format the post date
  const postDate = post.createdAt ? new Date(post.createdAt) : null;
  const formattedDate = postDate ? postDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : '';
  const formattedTime = postDate ? postDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  }) : '';

  return (
    <>
      <div className="w-full flex flex-col min-h-screen bg-transparent">
        {/* Navigation header for Mobile */}
        <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/[0.06] bg-[#111111]/80 px-4 py-3 backdrop-blur-2xl md:hidden">
          <Link href="/" aria-label="Back to feed">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10 active:scale-95 transition-transform">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold tracking-tight text-white">Post</h1>
        </div>

        {/* Post Header */}
        <PostHeader post={post} onEditClick={() => setShowEditDialog(true)} />

        {/* Post Content */}
        <div className="px-4 sm:px-5 pb-3 space-y-3">
          {post.content && (
            <div className="text-[16px] sm:text-[17px] leading-[1.65] text-white/90 break-words">
              <MarkdownRenderer content={post.content} />
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/search?q=${tag}`} 
                  className="text-[14px] text-[#00D084] hover:text-[#00E895] hover:underline transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {hasMedia && (
          <div className="w-full">
            <PostMedia post={post} onDoubleLike={handleLikeToggle} />
          </div>
        )}

        {/* Timestamp & Views */}
        <div className="px-4 sm:px-5 py-3 flex items-center gap-2 text-[13px] text-white/40 border-b border-white/[0.06]">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedTime}</span>
          <span>·</span>
          <span>{formattedDate}</span>
          {post.viewsCount != null && Number(post.viewsCount) > 0 && (
            <>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{Number(post.viewsCount).toLocaleString()} views</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="border-b border-white/[0.06]">
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

        {/* Comment Input */}
        <div className="px-4 sm:px-5 py-4 border-b border-white/[0.06]">
          <CommentInput onSubmit={handleCommentSubmit} autoFocus={false} />
        </div>

        {/* Comments Section */}
        <div className="flex flex-col w-full">
          {/* Comments Header */}
          <div className="px-4 sm:px-5 py-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-white/40" />
            <span className="text-[13px] font-semibold text-white/50 uppercase tracking-wide">
              Comments
            </span>
            {totalComments > 0 && (
              <span className="text-[12px] text-white/30 font-medium">({totalComments})</span>
            )}
          </div>
          
          {/* Comments List */}
          <div className="px-4 sm:px-5 pb-8">
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
        </div>
      </div>

      <SharePostDialog postId={post.id} open={showShareDialog} onOpenChange={setShowShareDialog} />
      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <EditPostDialog post={post} open={showEditDialog} onOpenChange={setShowEditDialog} />
    </>
  );
}
