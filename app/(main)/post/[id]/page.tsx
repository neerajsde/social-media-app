'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  Heart,
  Repeat2,
  Share2,
  Bookmark,
  Eye,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PostCard from '@/components/shared/PostCard';
import PostMediaViewer from '@/components/shared/PostMediaViewer';
import AuthDialog from '@/components/shared/AuthDialog';
import { useAppSelector } from '@/lib/hooks';
import {
  useCommentOnPostMutation,
  useGetPostCommentsQuery,
  useGetPostQuery,
  useGetCommentRepliesQuery,
  useLikePostMutation,
  useDislikePostMutation,
  useBookmarkPostMutation,
  useRepostMutation,
  useSharePostExternallyMutation,
  useLikeCommentMutation,
  useReplyToCommentMutation,
} from '@/lib/features/post/postApi';
import { normalizeFeedPost } from '@/lib/post-utils';
import { formatCount, timeAgo } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { PostAuthor } from '@/lib/types';

type ApiComment = {
  id: string;
  content: string;
  likesCount?: number;
  likeCount?: number;
  repliesCount?: number;
  replyCount?: number;
  isLiked?: boolean;
  createdAt: string;
  user?: PostAuthor;
  author?: PostAuthor;
};

interface RepliesSectionProps {
  commentId: string;
  author: PostAuthor;
  loadedCount: number;
  totalCount: number;
  onLoadMore: () => void;
  likedComments: Set<string>;
  onLikeComment: (commentId: string) => void;
  isLikingComment: boolean;
}

function RepliesSection({
  commentId,
  author,
  loadedCount,
  totalCount,
  onLoadMore,
  likedComments,
  onLikeComment,
  isLikingComment,
}: RepliesSectionProps) {
  const { data: repliesResponse, isLoading: isLoadingReplies, error: repliesError } = useGetCommentRepliesQuery({
    commentId,
    limit: Math.max(10, loadedCount),
  });

  // Handle different response formats
  let replies: ApiComment[] = [];
  
  if (repliesResponse) {
    const responseData = repliesResponse.data;
    
    // Try different ways to extract replies from response
    if (Array.isArray(responseData)) {
      replies = responseData;
    } else if (responseData && typeof responseData === 'object') {
      if ('replies' in responseData) {
        replies = Array.isArray((responseData as any).replies) ? (responseData as any).replies : [];
      } else if ('comments' in responseData) {
        replies = Array.isArray((responseData as any).comments) ? (responseData as any).comments : [];
      }
    }
  }

  // Take only the loaded count (for pagination) - show last N items
  const displayedReplies = replies.slice(-loadedCount);

  return (
    <div className="ml-8 space-y-2">
      {displayedReplies.length > 0 ? (
        displayedReplies.map((reply) => {
          const replyAuthor = reply.author ?? reply.user;
          if (!replyAuthor) return null;

          const isReplyLiked = likedComments.has(reply.id);
          const replyLikeCount = reply.likesCount ?? reply.likeCount ?? 0;

        return (
          <Card key={reply.id} className="border-border/30 bg-card/20">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <Link href={`/profile/${replyAuthor.username}`} className="shrink-0">
                  <Avatar className="h-7 w-7 ring-1 ring-border/30">
                    <AvatarImage src={replyAuthor.avatarUrl} alt={replyAuthor.username} />
                    <AvatarFallback className="bg-brand-medium/5 text-[10px]">
                      {replyAuthor.first_name?.[0] ?? replyAuthor.username[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/profile/${replyAuthor.username}`} className="hover:underline">
                      <p className="text-xs font-semibold truncate">
                        {replyAuthor.first_name ?? replyAuthor.username}
                      </p>
                    </Link>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {timeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{replyAuthor.username}
                  </p>
                  <p className="text-xs leading-relaxed text-foreground/90 mt-1 break-words">
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isLikingComment}
                      className={cn(
                        'h-7 px-1.5 gap-1 text-[10px]',
                        isReplyLiked && 'text-red-500'
                      )}
                      onClick={() => onLikeComment(reply.id)}
                    >
                      {isLikingComment ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Heart className={cn('w-3 h-3', isReplyLiked && 'fill-current')} />
                      )}
                      <span className="tabular-nums">{formatCount(replyLikeCount)}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        })
      ) : (
        isLoadingReplies ? null : (
          <p className="text-xs text-muted-foreground text-center py-2">No replies yet</p>
        )
      )}

      {isLoadingReplies && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {repliesError && (
        <p className="text-xs text-muted-foreground text-center py-2">Unable to load replies</p>
      )}

      {loadedCount < totalCount && !isLoadingReplies && displayedReplies.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLoadMore}
          className="w-full h-8 text-xs text-muted-foreground hover:text-brand-dark"
        >
          Show {Math.min(10, totalCount - loadedCount)} more {totalCount - loadedCount === 1 ? 'reply' : 'replies'}
        </Button>
      )}
    </div>
  );
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [commentContent, setCommentContent] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [repliesLoadedCount, setRepliesLoadedCount] = useState<Record<string, number>>({});
  
  // Post states
  const { data, isLoading, isError } = useGetPostQuery(id);
  const [commentOnPost, { isLoading: isCommenting }] = useCommentOnPostMutation();
  const { data: commentsResponse } = useGetPostCommentsQuery({ postId: id, limit: 50 });
  
  // Action mutations
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [dislikePost, { isLoading: isDisliking }] = useDislikePostMutation();
  const [bookmarkPost, { isLoading: isBookmarking }] = useBookmarkPostMutation();
  const [repost, { isLoading: isReposting }] = useRepostMutation();
  const [shareExternally, { isLoading: isSharing }] = useSharePostExternallyMutation();
  
  // Comment mutations
  const [likeComment, { isLoading: isLikingComment }] = useLikeCommentMutation();
  const [replyToComment, { isLoading: isReplyingToComment }] = useReplyToCommentMutation();
  
  // UI state
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  const post = data?.data ? normalizeFeedPost(data.data as unknown as Record<string, unknown>) : undefined;
  const commentsData = commentsResponse?.data as unknown as { comments?: ApiComment[] } | undefined;
  const comments = commentsData?.comments ?? [];
  
  const initialLikeCount = post?.likesCount ?? (post as { likeCount?: number })?.likeCount ?? 0;
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  
  const viewsCount = post?.viewsCount ?? (post as { viewCount?: number })?.viewCount ?? 0;
  const sharesCount = post?.sharesCount ?? (post as { shareCount?: number })?.shareCount ?? 0;
  
  const isActionLoading = isLiking || isDisliking || isBookmarking || isReposting || isSharing;

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (!commentContent.trim() || isCommenting) return;

    try {
      await commentOnPost({ postId: id, content: commentContent.trim() }).unwrap();
      setCommentContent('');
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

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
        await dislikePost(id).unwrap();
      } else {
        await likePost(id).unwrap();
      }
    } catch (err: unknown) {
      setLiked(wasLiked);
      setLikeCount(initialLikeCount);
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Could not update like';
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
      await repost({ postId: id, visibility: 'public' }).unwrap();
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

    const url = `${window.location.origin}/post/${id}`;

    try {
      await navigator.clipboard.writeText(url);
      await shareExternally(id).unwrap();
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (bookmarked || isActionLoading) return;

    try {
      await bookmarkPost(id).unwrap();
      setBookmarked(true);
      toast.success('Post saved');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Could not save post';
      toast.error(message);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const isLiked = likedComments.has(commentId);
    const newLikedComments = new Set(likedComments);
    
    if (isLiked) {
      newLikedComments.delete(commentId);
    } else {
      newLikedComments.add(commentId);
    }
    setLikedComments(newLikedComments);

    try {
      await likeComment({ commentId, postId: id }).unwrap();
    } catch (err: unknown) {
      // Revert on error
      setLikedComments(likedComments);
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Could not like comment';
      toast.error(message);
    }
  };

  const handleReplyComment = async (commentId: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (!replyContent.trim() || isReplyingToComment) return;

    try {
      await replyToComment({ commentId, content: replyContent.trim() }).unwrap();
      setReplyContent('');
      setReplyingToCommentId(null);
      toast.success('Reply posted');
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Failed to post reply';
      toast.error(message);
    }
  };

  const toggleExpandReplies = (commentId: string) => {
    const newExpandedReplies = new Set(expandedReplies);
    if (newExpandedReplies.has(commentId)) {
      newExpandedReplies.delete(commentId);
    } else {
      newExpandedReplies.add(commentId);
      // Initialize loaded count to 2 when expanding
      if (!repliesLoadedCount[commentId]) {
        setRepliesLoadedCount((prev) => ({ ...prev, [commentId]: 2 }));
      }
    }
    setExpandedReplies(newExpandedReplies);
  };

  const loadMoreReplies = (commentId: string) => {
    setRepliesLoadedCount((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || 2) + 10,
    }));
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Link href="/" aria-label="Back to feed">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-sm font-bold">Post details</h1>
      </div>

      {isLoading && <p className="p-8 text-center text-sm text-muted-foreground">Loading post…</p>}
      {isError && <p className="p-8 text-center text-sm text-muted-foreground">This post is unavailable or you do not have access to it.</p>}

      {post && (
        <div className="space-y-4 p-4">
          <PostCard post={post} showMedia={false} />
          <PostMediaViewer post={post} />
          
          {/* Post Actions */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 px-1 py-3 border-b border-border/40">
            <div className="flex flex-wrap items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading}
                className={cn(
                  'h-9 px-3 gap-1.5 text-xs',
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
                className="h-9 px-3 gap-1.5 text-xs text-muted-foreground hover:text-brand-dark dark:hover:text-brand-medium"
                aria-label="View comments"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="tabular-nums">{formatCount(post.commentsCount ?? 0)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading}
                className="h-9 px-3 gap-1.5 text-xs text-muted-foreground hover:text-brand-dark"
                onClick={handleRepost}
                aria-label="Repost"
              >
                {isReposting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Repeat2 className="w-4 h-4" />
                )}
                <span className="tabular-nums">{formatCount(sharesCount)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading}
                className="h-9 px-3 gap-1.5 text-xs text-muted-foreground hover:text-brand-dark"
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

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="tabular-nums">{formatCount(viewsCount)}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isActionLoading || bookmarked}
                className={cn(
                  'h-9 w-9 p-0',
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

          <Separator />

          <section className="space-y-4">
            <h2 className="flex items-center gap-1.5 px-1 text-sm font-semibold text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Comments ({formatCount(post.commentsCount)})
            </h2>

            {/* Comment Form Input Feature */}
            <form onSubmit={handleCommentSubmit} className="space-y-3 border-b border-border/40 pb-4">
              <div className="flex gap-3 items-start">
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/50">
                  <AvatarImage src={user?.avatarUrl} alt={user?.username ?? 'User avatar'} />
                  <AvatarFallback className="bg-brand-medium/10 text-xs font-semibold">
                    {user?.first_name?.[0] ?? user?.username?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  <Textarea
                    placeholder={isAuthenticated ? "Share your thoughts on this post..." : "Log in to leave a comment..."}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    disabled={!isAuthenticated}
                    className="resize-none min-h-[70px] bg-gradient-to-br from-card/60 to-card/30 border-border/60 focus-visible:ring-1 text-sm placeholder:text-muted-foreground/70 transition-colors"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={!commentContent.trim() || isCommenting}
                      className="gap-1.5 text-xs h-9"
                    >
                      {isCommenting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Comment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {comments.map((comment) => {
                const author = comment.author ?? comment.user;
                if (!author) return null;
                
                const isCommentLiked = likedComments.has(comment.id);
                const commentLikeCount = comment.likesCount ?? comment.likeCount ?? 0;
                const replyCount = comment.repliesCount ?? comment.replyCount ?? 0;
                const isReplyingToThis = replyingToCommentId === comment.id;

                return (
                  <div key={comment.id} className="space-y-2">
                    <Card className="border-border/50 bg-gradient-to-br from-card/60 to-card/30 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardContent className="p-4">
                        {/* Comment Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <Link href={`/profile/${author.username}`} className="shrink-0 hover:opacity-80 transition-opacity">
                            <Avatar className="h-9 w-9 ring-1 ring-border/50">
                              <AvatarImage src={author.avatarUrl} alt={author.username} />
                              <AvatarFallback className="bg-brand-medium/10 text-xs font-semibold">
                                {author.first_name?.[0] ?? author.username[0]}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Link href={`/profile/${author.username}`} className="hover:underline">
                                <p className="text-xs font-semibold truncate">
                                  {author.first_name ?? author.username}
                                </p>
                              </Link>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {timeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <Link href={`/profile/${author.username}`} className="hover:underline">
                              <p className="text-[11px] text-muted-foreground truncate">
                                @{author.username}
                              </p>
                            </Link>
                          </div>
                        </div>

                        {/* Comment Content */}
                        <div className="mb-3 ml-12">
                          <p className="text-sm leading-relaxed text-foreground/95 break-words">
                            {comment.content}
                          </p>
                        </div>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-2 ml-12">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLikingComment}
                            className={cn(
                              'h-8 px-2 gap-1.5 text-[11px]',
                              isCommentLiked && 'text-red-500'
                            )}
                            onClick={() => handleLikeComment(comment.id)}
                            aria-label={isCommentLiked ? 'Unlike comment' : 'Like comment'}
                          >
                            {isLikingComment ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Heart className={cn('w-3.5 h-3.5', isCommentLiked && 'fill-current')} />
                            )}
                            <span className="tabular-nums">{formatCount(commentLikeCount)}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 gap-1.5 text-[11px] text-muted-foreground hover:text-brand-dark"
                            onClick={() => setReplyingToCommentId(isReplyingToThis ? null : comment.id)}
                            aria-label="Reply to comment"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="tabular-nums">{replyCount > 0 ? formatCount(replyCount) : 'Reply'}</span>
                          </Button>

                          {replyCount > 0 && !expandedReplies.has(comment.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandReplies(comment.id)}
                              className="h-8 px-2 text-[11px] text-brand-dark hover:text-brand-medium ml-auto"
                            >
                              Show {formatCount(replyCount)} {replyCount === 1 ? 'reply' : 'replies'}
                            </Button>
                          )}

                          {expandedReplies.has(comment.id) && replyCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpandReplies(comment.id)}
                              className="h-8 px-2 text-[11px] text-muted-foreground ml-auto"
                            >
                              Hide replies
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Render Replies */}
                    {expandedReplies.has(comment.id) && replyCount > 0 && (
                      <RepliesSection
                        commentId={comment.id}
                        author={author}
                        loadedCount={repliesLoadedCount[comment.id] || 2}
                        totalCount={replyCount}
                        onLoadMore={() => loadMoreReplies(comment.id)}
                        likedComments={likedComments}
                        onLikeComment={handleLikeComment}
                        isLikingComment={isLikingComment}
                      />
                    )}

                    {/* Reply Form */}
                    {isReplyingToThis && (
                      <div className="ml-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                        <div className="flex gap-3 items-start bg-card/40 rounded-lg p-3 border border-border/30">
                          <Avatar className="h-8 w-8 shrink-0 mt-1">
                            <AvatarImage src={user?.avatarUrl} alt={user?.username ?? 'User avatar'} />
                            <AvatarFallback className="bg-brand-medium/10 text-xs">
                              {user?.first_name?.[0] ?? user?.username?.[0] ?? '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Replying to <span className="font-semibold text-foreground">@{author.username}</span>
                            </p>
                            <Textarea
                              placeholder="Write a reply..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              rows={2}
                              className="resize-none min-h-[50px] bg-background/50 border-border/60 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReplyingToCommentId(null);
                                  setReplyContent('');
                                }}
                                className="h-8 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                disabled={!replyContent.trim() || isReplyingToComment}
                                onClick={() => handleReplyComment(comment.id)}
                                className="h-8 gap-1 text-xs"
                              >
                                {isReplyingToComment ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Posting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-3 h-3" />
                                    Reply
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Renders the AuthDialog layout container */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}