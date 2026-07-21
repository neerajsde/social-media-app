'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Pencil, ShieldAlert, Loader2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/lib/hooks';
import { timeAgo } from '@/lib/mock-data';
import type { Comment } from '@/lib/types';
import {
  useDeleteCommentMutation,
  useEditCommentMutation,
  useReplyToCommentMutation,
  useGetCommentRepliesQuery,
} from '@/lib/features/post/postApi';
import { toast } from 'sonner';
import CommentLikeButton from './CommentLikeButton';
import ReplyButton from './ReplyButton';
import CommentInput from './CommentInput';
import CommentReply from './CommentReply';

interface CommentItemProps {
  comment: Comment;
  postId: string;
}

export default function CommentItem({ comment, postId }: CommentItemProps) {
  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showRepliesList, setShowRepliesList] = useState(false);
  
  // Replies pagination count
  const [repliesLimit, setRepliesLimit] = useState(5);

  const [editComment, { isLoading: isEditingLoading }] = useEditCommentMutation();
  const [deleteComment, { isLoading: isDeletingLoading }] = useDeleteCommentMutation();
  const [replyToComment] = useReplyToCommentMutation();

  // RTK Query to fetch comment replies
  const {
    data: repliesResponse,
    isLoading: isLoadingReplies,
    isFetching: isFetchingReplies,
    refetch: refetchReplies,
  } = useGetCommentRepliesQuery(
    { commentId: comment.id, limit: repliesLimit },
    { skip: !showRepliesList }
  );

  const author = comment.author || {
    id: 'unknown',
    username: 'anonymous',
    avatarUrl: undefined,
    first_name: 'NexusPlay',
    last_name: 'User',
    isVerified: false,
  };

  const handleEditSubmit = async () => {
    if (!editText.trim() || isEditingLoading) return;
    try {
      await editComment({ commentId: comment.id, content: editText.trim() }).unwrap();
      setIsEditing(false);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({ postId, commentId: comment.id }).unwrap();
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleReport = () => {
    toast.success('Comment reported successfully');
  };

  const handleReplySubmit = async (content: string) => {
    try {
      await replyToComment({ commentId: comment.id, content }).unwrap();
      setShowReplyInput(false);
      setShowRepliesList(true);
      toast.success('Reply posted');
      refetchReplies();
    } catch {
      toast.error('Failed to post reply');
    }
  };

  const repliesList = repliesResponse?.data || [];
  const repliesTotal = repliesResponse?.total || comment.repliesCount || comment.replies?.length || 0;
  const hasMoreReplies = repliesList.length < repliesTotal;

  const handleLoadMoreReplies = () => {
    setRepliesLimit((prev) => prev + 5);
  };

  const isCommentOwner = author.id === currentUser?.id;

  return (
    <div className="space-y-2 border-b border-border/20 pb-4">
      {/* Top Comment Card */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${author.username}`} className="shrink-0">
          <Avatar className="w-8 h-8 ring-1 ring-border/50">
            <AvatarImage src={author.avatarUrl} alt={author.username} />
            <AvatarFallback className="bg-brand-medium/10 text-xs font-bold">
              {author.first_name?.[0] || author.username[0]}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
              <Link href={`/profile/${author.username}`} className="text-xs font-bold hover:underline text-foreground truncate">
                {author.first_name ? `${author.first_name} ${author.last_name || ''}`.trim() : author.username}
              </Link>
              {author.isVerified && (
                <svg className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              <span className="text-[10px] text-muted-foreground">@{author.username}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full shrink-0" />
                }
              >
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-card/95 border-border/80 backdrop-blur-xl">
                {isCommentOwner ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 cursor-pointer text-xs">
                      <Pencil className="w-4 h-4" />
                      Edit Comment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} disabled={isDeletingLoading} className="gap-2 cursor-pointer text-xs text-red-500 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                      Delete Comment
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleReport} className="gap-2 cursor-pointer text-xs text-red-500 hover:text-red-500">
                    <ShieldAlert className="w-4 h-4" />
                    Report Comment
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-1">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] resize-none text-xs bg-background/50 border-border/60"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.content);
                  }}
                  className="h-7 px-3 text-[11px]"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!editText.trim() || isEditingLoading}
                  onClick={handleEditSubmit}
                  className="h-7 px-3 text-[11px]"
                >
                  {isEditingLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-foreground/95 leading-relaxed break-words pr-2 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              {timeAgo(comment.createdAt)}
            </span>

            <CommentLikeButton
              commentId={comment.id}
              postId={postId}
              initialIsLiked={comment.isLiked || false}
              initialLikesCount={comment.likesCount || 0}
            />

            <ReplyButton
              onClick={() => setShowReplyInput(!showReplyInput)}
              replyCount={0} // Display label "Reply"
            />
          </div>
        </div>
      </div>

      {/* Reply input drawer */}
      {showReplyInput && (
        <div className="ml-8 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CommentInput
            onSubmit={handleReplySubmit}
            placeholder={`Reply to @${author.username}...`}
            submitLabel="Reply"
            autoFocus
          />
        </div>
      )}

      {/* Nested Replies Section */}
      {repliesTotal > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {/* Toggle Button replies list */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRepliesList(!showRepliesList)}
            className="h-7 text-[10px] font-bold text-brand-medium hover:text-brand-dark px-1 hover:bg-transparent"
          >
            {showRepliesList ? (
              <span className="flex items-center gap-1">
                <ChevronUp className="w-3 h-3" />
                Hide replies
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <ChevronDown className="w-3 h-3" />
                View {repliesTotal} {repliesTotal === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </Button>

          {/* Replies Items list */}
          {showRepliesList && (
            <div className="space-y-2.5 pt-1 border-l-2 border-border/30 pl-3">
              {repliesList.map((reply) => (
                <CommentReply
                  key={reply.id}
                  reply={reply}
                  postId={postId}
                  parentCommentId={comment.id}
                  onReplyTrigger={(uname) => {
                    setShowReplyInput(true);
                    // Autofocus and populate is handled in CommentInput via state
                  }}
                />
              ))}

              {isFetchingReplies && !isLoadingReplies && (
                <div className="flex justify-center py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
              )}

              {hasMoreReplies && !isFetchingReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadMoreReplies}
                  className="h-6 text-[10px] text-muted-foreground hover:text-foreground hover:bg-transparent font-bold p-0"
                >
                  View more replies...
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
