'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { getMediaUrl } from '@/lib/media-url';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import HlsVideoPlayer from './HlsVideoPlayer';

interface PostMediaProps {
  post: Post;
  onDoubleLike?: () => void;
}

export default function PostMedia({ post, onDoubleLike }: PostMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const images = post.images ?? [];
  const videoUrl = post.video?.hlsMasterKey || post.video?.originalVideo || post.mediaUrl;

  const handleDoubleClick = () => {
    if (onDoubleLike) {
      onDoubleLike();
    }
    setShowHeartPop(true);
    setTimeout(() => {
      setShowHeartPop(false);
    }, 800);
  };

  const goTo = (index: number) => {
    setActiveIndex((index + images.length) % images.length);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 40) return;
    goTo(activeIndex + (distance < 0 ? 1 : -1));
  };

  if (images.length > 0) {
    return (
      <div
        className="relative overflow-hidden rounded-xl bg-black/95 select-none aspect-square sm:aspect-[4/3] group border border-border/30 shadow-inner flex items-center justify-center"
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        {/* Slides */}
        <div
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="flex h-full w-full shrink-0 items-center justify-center relative bg-black/40 overflow-hidden"
            >
              <img
                src={getMediaUrl(image)}
                alt={`Post image ${index + 1}`}
                draggable={false}
                className="h-full w-full object-cover sm:object-contain transition-transform duration-500 hover:scale-102 cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Double click heart popup overlay */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] animate-fade-in pointer-events-none z-30">
            <div className="animate-scale-pop">
              <Heart className="w-24 h-24 text-red-500 fill-current drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            </div>
          </div>
        )}

        {/* Gallery index overlay top-right */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded-full font-semibold border border-white/10 z-20">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Left/Right Chevron Navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex - 1);
              }}
              className="absolute left-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/75 hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex + 1);
              }}
              className="absolute right-3 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/75 hover:scale-105 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Bottom dots */}
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm border border-white/5">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    index === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div
        className="relative overflow-hidden rounded-xl bg-black border border-border/30 shadow-inner flex items-center justify-center"
        onDoubleClick={handleDoubleClick}
      >
        <HlsVideoPlayer
          src={getMediaUrl(videoUrl) || ''}
          poster={getMediaUrl(post.video?.thumbnail || post.thumbnailUrl)}
          controls
          playsInline
          autoPlayOnScroll={true}
          className="aspect-video max-h-[75vh] w-full bg-black relative z-10"
        >
          Your browser does not support video playback.
        </HlsVideoPlayer>

        {/* Double click heart popup overlay for video */}
        {showHeartPop && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] animate-fade-in pointer-events-none z-30">
            <div className="animate-scale-pop">
              <Heart className="w-24 h-24 text-red-500 fill-current drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
