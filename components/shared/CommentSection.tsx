'use client';

import { useState } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import CommentItem from './CommentItem';
import type { Comment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  isLoading: boolean;
  isFetching: boolean;
  totalComments: number;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function CommentSection({
  comments,
  postId,
  isLoading,
  isFetching,
  totalComments,
  onLoadMore,
  hasMore,
}: CommentSectionProps) {
  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-4 py-6 px-1">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32 bg-muted" />
              <Skeleton className="h-3 w-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border/30 rounded-2xl bg-card/5">
        <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground/50 mb-3">
          <MessageCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-foreground/80">No comments yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Be the first to share your thoughts on this post!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header comment stats */}
      <div className="text-xs font-bold text-muted-foreground px-1 uppercase tracking-wider flex items-center justify-between">
        <span>Comments ({totalComments})</span>
      </div>

      <div className="space-y-4 divide-y divide-border/10">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isFetching}
            className="w-full text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-xl py-2 h-9"
          >
            {isFetching ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : null}
            Load older comments
          </Button>
        </div>
      )}
    </div>
  );
}
