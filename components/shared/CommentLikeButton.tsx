'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLikeCommentMutation } from '@/lib/features/post/postApi';
import { useAppSelector } from '@/lib/hooks';
import LoginRequiredDialog from './LoginRequiredDialog';
import { formatCount } from '@/lib/mock-data';
import { toast } from 'sonner';

interface CommentLikeButtonProps {
  commentId: string;
  postId: string;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export default function CommentLikeButton({
  commentId,
  postId,
  initialIsLiked,
  initialLikesCount,
}: CommentLikeButtonProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [liked, setLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [likeComment, { isLoading }] = useLikeCommentMutation();

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));

    try {
      await likeComment({ commentId, postId }).unwrap();
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikesCount(wasLiked ? likesCount + 1 : Math.max(0, likesCount - 1));
      toast.error('Failed to update comment like status');
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={isLoading}
        onClick={handleLikeToggle}
        className={cn(
          'h-7 px-2 gap-1 text-[11px] text-muted-foreground hover:bg-transparent transition-all duration-200 hover:text-foreground',
          liked && 'text-red-500 hover:text-red-600'
        )}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Heart className={cn('w-3.5 h-3.5 transition-transform duration-200 active:scale-120', liked && 'fill-current scale-105')} />
        )}
        <span className="tabular-nums font-semibold">{formatCount(likesCount)}</span>
      </Button>

      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
