'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '@/lib/media-url';
import type { Post } from '@/lib/types';
import HlsVideoPlayer from './HlsVideoPlayer';

export default function PostMediaViewer({ post }: { post: Post }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const images = post.images ?? [];
  const videoUrl = post.video?.hlsMasterKey || post.video?.originalVideo || post.mediaUrl;

  if (images.length > 0) {
    const goTo = (index: number) => setActiveIndex((index + images.length) % images.length);
    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
      if (touchStartX.current === null) return;
      const distance = event.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(distance) < 40) return;
      goTo(activeIndex + (distance < 0 ? 1 : -1));
    };

    return (
      <div
        className="relative overflow-hidden rounded-xl bg-black select-none"
        onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="flex w-full shrink-0 items-center justify-center aspect-square sm:aspect-[4/3]">
              <img
                src={getMediaUrl(image)}
                alt={`Post image ${index + 1}`}
                draggable={false}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white shadow hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white shadow hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`View image ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-white' : 'w-2 bg-white/60 hover:bg-white'}`}
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
      <HlsVideoPlayer
        src={getMediaUrl(videoUrl) || ''}
        poster={getMediaUrl(post.video?.thumbnail || post.thumbnailUrl)}
        controls
        playsInline
        autoPlayOnScroll={true}
        className="aspect-video max-h-[75vh] w-full rounded-xl bg-black"
      >
        Your browser does not support video playback.
      </HlsVideoPlayer>
    );
  }

  return null;
}
