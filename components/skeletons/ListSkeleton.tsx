import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

export default function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="w-3/4 max-w-[200px] h-4" />
            <Skeleton className="w-1/2 max-w-[150px] h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
