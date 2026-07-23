import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReelSkeleton() {
  return (
    <div className="relative w-full h-full md:h-[calc(100vh-2rem)] md:rounded-2xl snap-start flex items-center justify-center bg-[#111111] overflow-hidden">
      {/* Background Pulsing */}
      <Skeleton className="absolute inset-0 bg-white/5" />

      {/* Info Overlay Skeleton (Bottom Left) */}
      <div className="absolute bottom-0 left-0 right-16 p-4 z-20 pointer-events-none flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <div className="flex flex-col gap-2">
            {/* Username & Follow Button */}
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-4 bg-white/10" />
              <Skeleton className="w-16 h-6 rounded-full bg-white/10" />
            </div>
            {/* Music/Audio track */}
            <Skeleton className="w-32 h-3 bg-white/10" />
          </div>
        </div>

        {/* Caption */}
        <div className="space-y-2 pl-1">
          <Skeleton className="w-full max-w-[280px] h-3 bg-white/10" />
          <Skeleton className="w-3/4 max-w-[200px] h-3 bg-white/10" />
        </div>
      </div>

      {/* Action Buttons Skeleton (Bottom Right) */}
      <div className="absolute bottom-4 right-2 z-20 flex flex-col gap-4 items-center w-14">
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <Skeleton className="w-6 h-3 bg-white/10 mt-1" />
        </div>
        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <Skeleton className="w-6 h-3 bg-white/10 mt-1" />
        </div>
        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <Skeleton className="w-6 h-3 bg-white/10 mt-1" />
        </div>
        {/* Bookmark */}
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
        </div>
        {/* More Options */}
        <div className="flex flex-col items-center mt-2">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
