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
import { useFollowUserMutation, useUnfollowUserMutation } from '@/lib/features/user/userApi';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

interface ReelCardProps {
  post: Post;
  isActive: boolean;
  onCommentClick: () => void;
  onShareClick: () => void;
  onAuthRequired: () => void;
  globalMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
}

export default function ReelCard({
  post,
  isActive,
  onCommentClick,
  onShareClick,
  onAuthRequired,
  globalMuted,
  onMuteChange
}: ReelCardProps) {
  const { isAuthenticated, user: currentUser } = useAppSelector((state) => state.auth);
  
  const author = post.author || post.user;
  const isPostOwner = post.isOwnPost || author?.id === currentUser?.id;
  
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState((post as any).likeCount || post.likesCount || 0);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isFollowing, setIsFollowing] = useState(post.isFollowingAuthor || false);

  const [likePost] = useLikePostMutation();
  const [dislikePost] = useDislikePostMutation();
  const [bookmarkPost] = useBookmarkPostMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

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
    setLikeCount((c: number) => newLikedState ? c + 1 : Math.max(0, c - 1));

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

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      onAuthRequired();
      return;
    }
    const authorId = post.author?.id || post.user?.id;
    if (!authorId) return;

    try {
      if (isFollowing) {
        await unfollowUser(authorId).unwrap();
        setIsFollowing(false);
        toast.success(`Unfollowed @${post.author?.username || post.user?.username}`);
      } else {
        await followUser(authorId).unwrap();
        setIsFollowing(true);
        toast.success(`Followed @${post.author?.username || post.user?.username}`);
      }
    } catch {
      toast.error('Failed to update follow status');
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
        globalMuted={globalMuted}
        onMuteChange={onMuteChange}
      />

      <ReelInfo 
        post={post} 
        isFollowing={isFollowing}
        followsYou={(post as any).followsYouAuthor}
        isOwner={isPostOwner}
        onFollow={handleFollowToggle}
      />

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
