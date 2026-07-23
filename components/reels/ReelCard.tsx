'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import type { Post } from '@/lib/types';
import ReelVideo from './ReelVideo';
import ReelInfo from './ReelInfo';
import ReelActions from './ReelActions';
import { 
  useLikePostMutation, 
  useDislikePostMutation, 
  useBookmarkPostMutation 
} from '@/lib/features/post/postApi';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

interface ReelCardProps {
  post: Post;
  isActive: boolean;
  onCommentClick: () => void;
  onShareClick: () => void;
  onAuthRequired: () => void;
}

export default function ReelCard({
  post,
  isActive,
  onCommentClick,
  onShareClick,
  onAuthRequired
}: ReelCardProps) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState((post as any).likeCount || post.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const [likePost] = useLikePostMutation();
  const [dislikePost] = useDislikePostMutation();
  const [bookmarkPost] = useBookmarkPostMutation();

  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    setLiked(post.isLiked || false);
    setLikeCount((post as any).likeCount || post.likesCount || 0);
    setBookmarked(post.isBookmarked || false);
  }, [post]);

  const handleLikeToggle = async (forceLike = false) => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    if (forceLike && liked) return; // Already liked

    const wasLiked = liked;
    const previousLikeCount = likeCount;
    const newLikedState = forceLike ? true : !wasLiked;

    setLiked(newLikedState);
    setLikeCount(c => newLikedState ? c + 1 : Math.max(0, c - 1));

    if (newLikedState) setShowHeartAnim(true);

    try {
      if (newLikedState && !wasLiked) {
        await likePost(post.id).unwrap();
      } else if (!newLikedState && wasLiked) {
        await dislikePost(post.id).unwrap();
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount(previousLikeCount);
      toast.error('Failed to update like status');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }

    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    try {
      await bookmarkPost(post.id).unwrap();
      toast.success(wasBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch {
      setBookmarked(wasBookmarked);
      toast.error('Failed to update bookmark');
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent other events if necessary
    handleLikeToggle(true);
  };

  return (
    <div 
      className="relative w-full h-full snap-start flex items-center justify-center bg-black overflow-hidden"
      onDoubleClick={handleDoubleClick}
    >
      <ReelVideo 
        src={post.video?.hlsMasterKey || post.video?.originalVideo || ''} 
        isActive={isActive}
        poster={post.video?.thumbnail || ''}
      />

      <ReelInfo post={post} />

      <ReelActions 
        liked={liked}
        likeCount={likeCount}
        commentCount={(post as any).commentCount || post.commentsCount || 0}
        bookmarked={bookmarked}
        onLike={() => handleLikeToggle(false)}
        onComment={onCommentClick}
        onShare={onShareClick}
        onBookmark={handleBookmarkToggle}
      />

      {/* Heart Animation for Double Tap */}
      {showHeartAnim && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 animate-in zoom-in duration-300 fade-out-0 fade-in-100 fill-mode-forwards"
          onAnimationEnd={() => setShowHeartAnim(false)}
        >
          <Heart className="w-32 h-32 text-[#e11d48] fill-[#e11d48] drop-shadow-2xl opacity-90 scale-150 transition-transform" />
        </div>
      )}
    </div>
  );
}
