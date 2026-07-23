import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function MessageSkeleton({ count = 6 }: { count?: number }) {
  // Generate a pattern of left and right aligned message bubbles
  const pattern = [false, false, true, false, true, true];
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Array.from({ length: count }).map((_, i) => {
        const isMe = pattern[i % pattern.length];
        
        return (
          <div key={i} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
            <div className={cn("flex gap-2 max-w-[70%]", isMe && "flex-row-reverse")}>
              {/* Avatar for others */}
              {!isMe && <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-auto" />}
              
              {/* Message bubble */}
              <Skeleton 
                className={cn(
                  "h-10 rounded-2xl", 
                  // Randomize widths a bit based on index for visual variety
                  i % 3 === 0 ? "w-48" : i % 2 === 0 ? "w-32" : "w-64",
                  isMe ? "rounded-br-sm bg-brand-medium/40" : "rounded-bl-sm"
                )} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
