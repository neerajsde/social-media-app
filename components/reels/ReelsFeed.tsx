'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Post } from '@/lib/types';
import ReelCard from './ReelCard';
import { Loader2 } from 'lucide-react';
import ReelCommentsSheet from './ReelCommentsSheet';
import SharePostDialog from '../shared/SharePostDialog';
import LoginRequiredDialog from '../shared/LoginRequiredDialog';
import { cn } from '@/lib/utils';

interface ReelsFeedProps {
  reels: Post[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  className?: string;
}

export default function ReelsFeed({ reels, isLoading, hasMore, onLoadMore, className }: ReelsFeedProps) {
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Dialog / Sheet states
  const [commentsReelId, setCommentsReelId] = useState<string | null>(null);
  const [shareReelId, setShareReelId] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  
  // Audio state
  const [globalMuted, setGlobalMuted] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const container = containerRef.current;
      if (!container) return;

      const clientHeight = container.clientHeight;
      const currentScroll = container.scrollTop;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          container.scrollBy({ top: -clientHeight, behavior: 'smooth' });
          break;
        case 'ArrowDown':
          e.preventDefault();
          container.scrollBy({ top: clientHeight, behavior: 'smooth' });
          break;
        // Space and M are handled by individual videos (tap to pause/mute) or could be handled globally here
        // but since we want the active video to respond, it's easier to dispatch a custom event or let standard 
        // focus handle it. Since ReelVideo handles clicks, we'll let it be for now, or add a custom event.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Intersection Observer for active reel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const id = entry.target.getAttribute('data-reel-id');
            if (id) setActiveReelId(id);
            
            // If it's the last few elements, load more
            const index = Number(entry.target.getAttribute('data-index'));
            if (index >= reels.length - 2 && hasMore && !isLoading) {
              onLoadMore();
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [reels, hasMore, isLoading, onLoadMore]);

  // Set initial active reel
  useEffect(() => {
    if (reels.length > 0 && !activeReelId) {
      setActiveReelId(reels[0].id);
    }
  }, [reels, activeReelId]);

  if (reels.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50">
        <p>No reels available</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-[100dvh] md:h-screen overflow-y-scroll overflow-x-hidden snap-y snap-mandatory bg-black [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      style={{ scrollBehavior: 'smooth' }}
    >
      {reels.map((reel, index) => (
        <div 
          key={reel.id}
          ref={(el) => { reelRefs.current[index] = el; }}
          data-reel-id={reel.id}
          data-index={index}
          className="w-full h-full snap-start relative flex justify-center items-center"
        >
          {/* Constrain width on desktop for 9:16 aspect ratio */}
          <div className="w-full h-full md:w-[450px] overflow-hidden relative">
            <ReelCard 
              post={reel}
              isActive={activeReelId === reel.id}
              onCommentClick={() => setCommentsReelId(reel.id)}
              onShareClick={() => setShareReelId(reel.id)}
              onAuthRequired={() => setAuthRequired(true)}
              globalMuted={globalMuted}
              onMuteChange={setGlobalMuted}
            />
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="w-full h-32 flex items-center justify-center snap-start">
          <Loader2 className="w-8 h-8 text-[#00D084] animate-spin" />
        </div>
      )}

      {/* Sheets & Dialogs */}
      <ReelCommentsSheet 
        postId={commentsReelId}
        open={!!commentsReelId}
        onOpenChange={(open) => !open && setCommentsReelId(null)}
        totalComments={reels.find(r => r.id === commentsReelId)?.commentsCount || 0}
      />

      <SharePostDialog 
        postId={shareReelId || ''}
        open={!!shareReelId}
        onOpenChange={(open) => !open && setShareReelId(null)}
      />

      <LoginRequiredDialog 
        open={authRequired}
        onOpenChange={setAuthRequired}
      />
    </div>
  );
}
