'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, Trash2, Pencil, ShieldAlert, Loader2, Check, X } from 'lucide-react';
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
import { useDeleteCommentMutation, useEditCommentMutation } from '@/lib/features/post/postApi';
import { toast } from 'sonner';
import CommentLikeButton from './CommentLikeButton';

interface CommentReplyProps {
  reply: Comment;
  postId: string;
  parentCommentId: string;
  onReplyTrigger?: (username: string) => void;
}

export default function CommentReply({
  reply,
  postId,
  parentCommentId,
  onReplyTrigger,
}: CommentReplyProps) {
  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content);
  
  const [editComment, { isLoading: isEditingLoading }] = useEditCommentMutation();
  const [deleteComment, { isLoading: isDeletingLoading }] = useDeleteCommentMutation();

  const author = reply.author || (reply as any).user || {
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
      await editComment({ commentId: reply.id, content: editText.trim() }).unwrap();
      setIsEditing(false);
      toast.success('Reply updated');
    } catch {
      toast.error('Failed to update reply');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment({ postId, commentId: reply.id }).unwrap();
      toast.success('Reply deleted');
    } catch {
      toast.error('Failed to delete reply');
    }
  };

  const handleReport = () => {
    toast.success('Reply reported successfully');
  };

  const isReplyOwner = author.id === currentUser?.id;

  const renderContentWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <Link key={i} href={`/profile/${part.substring(1)}`} className="text-[#05a85c] hover:underline font-semibold">
            {part}
          </Link>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-card/25 hover:bg-card/40 transition-colors animate-in fade-in slide-in-from-left-2 duration-200">
      <Link href={`/profile/${author.username}`} className="shrink-0">
        <Avatar className="w-7 h-7 ring-1 ring-border/40">
          <AvatarImage src={author.avatarUrl} alt={author.username} />
          <AvatarFallback className="bg-brand-medium/10 text-[10px] font-bold">
            {author.first_name?.[0] || author.username[0]}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
            <Link href={`/profile/${author.username}`} className="text-xs font-semibold hover:underline text-foreground truncate">
              {author.first_name ? `${author.first_name} ${author.last_name || ''}`.trim() : author.username}
            </Link>
            {author.isVerified && (
              <svg className="w-3 h-3 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
            <span className="text-[10px] text-muted-foreground">@{author.username}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full shrink-0" />
              }
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-card/95 border-border/80 backdrop-blur-xl">
              {isReplyOwner ? (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2 cursor-pointer text-xs">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeletingLoading} className="gap-2 cursor-pointer text-xs text-red-500 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handleReport} className="gap-2 cursor-pointer text-xs text-red-500 hover:text-red-500">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditing ? (
          <div className="space-y-1.5 mt-1">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[50px] resize-none text-xs bg-background/50 border-border/60"
            />
            <div className="flex justify-end gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(reply.content);
                }}
                className="h-6 px-2 text-[10px]"
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!editText.trim() || isEditingLoading}
                onClick={handleEditSubmit}
                className="h-6 px-2 text-[10px]"
              >
                {isEditingLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-foreground/90 leading-relaxed break-words pr-2 whitespace-pre-wrap">
            {renderContentWithMentions(reply.content)}
          </p>
        )}

        {/* Action Row */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] text-muted-foreground font-medium">
            {timeAgo(reply.createdAt)}
          </span>

          <CommentLikeButton
            commentId={reply.id}
            postId={postId}
            initialIsLiked={reply.isLiked || false}
            initialLikesCount={reply.likesCount ?? (reply as any).likeCount ?? 0}
          />

          {onReplyTrigger && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReplyTrigger(author.username)}
              className="h-7 px-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Reply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
