'use client';

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useGetPostCommentsQuery, useCommentOnPostMutation } from '@/lib/features/post/postApi';
import type { Comment } from '@/lib/types';
import CommentSection from '../shared/CommentSection';
import CommentInput from '../shared/CommentInput';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface ReelCommentsSheetProps {
  postId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalComments: number;
}

export default function ReelCommentsSheet({ postId, open, onOpenChange, totalComments: initialTotal }: ReelCommentsSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [page, setPage] = useState(1);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);

  const { data: commentsResponse, isLoading, isFetching } = useGetPostCommentsQuery(
    { postId: postId as string, page, limit: 15 },
    { skip: !postId || !open }
  );

  const [commentOnPost] = useCommentOnPostMutation();

  useEffect(() => {
    if (!open) {
      setPage(1);
      setCommentsList([]);
    }
  }, [open]);

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

  const handleCommentSubmit = async (content: string) => {
    if (!postId) return;
    try {
      await commentOnPost({ postId, content }).unwrap();
      setPage(1);
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const totalComments = commentsResponse?.total || initialTotal || commentsList.length || 0;
  const hasMoreComments = commentsList.length < totalComments;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isDesktop ? "right" : "bottom"} 
        className={cn(
          "bg-[#111111] border-white/10 text-white flex flex-col p-0",
          isDesktop ? "w-[400px] sm:max-w-[400px]" : "h-[75vh] rounded-t-3xl"
        )}
      >
        <SheetHeader className="p-4 border-b border-white/10 sticky top-0 bg-[#111111] z-10">
          <SheetTitle className="text-center text-sm font-bold text-white">
            Comments <span className="text-white/60 font-normal">({totalComments})</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <CommentSection
            comments={commentsList}
            postId={postId || ''}
            isLoading={isLoading}
            isFetching={isFetching}
            totalComments={totalComments}
            onLoadMore={() => setPage((p) => p + 1)}
            hasMore={hasMoreComments}
          />
        </div>

        <div className="p-3 border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky bottom-0">
          <CommentInput onSubmit={handleCommentSubmit} autoFocus={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
