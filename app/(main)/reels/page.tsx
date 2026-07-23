'use client';

import React, { useState, useEffect } from 'react';
import { useGetReelsQuery } from '@/lib/features/post/postApi';
import ReelsFeed from '@/components/reels/ReelsFeed';
import { Loader2 } from 'lucide-react';
import type { Post } from '@/lib/types';

export default function ReelsPage() {
  const [page, setPage] = useState(1);
  const [reels, setReels] = useState<Post[]>([]);
  
  const { data, isLoading, isFetching } = useGetReelsQuery({ page, limit: 10 });

  useEffect(() => {
    if (data?.data) {
      const rawPosts = data.data as any;
      const normalized = Array.isArray(rawPosts) ? rawPosts : (rawPosts.posts || []);
      
      if (page === 1) {
        setReels(normalized);
      } else {
        setReels((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const next = normalized.filter((p: any) => !seen.has(p.id));
          return [...prev, ...next];
        });
      }
    }
  }, [data, page]);

  const totalPosts = data?.total || reels.length;
  const hasMore = reels.length < totalPosts;

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage(p => p + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="w-full h-[100dvh] md:h-screen flex items-center justify-center bg-[#111111]">
        <Loader2 className="w-10 h-10 text-[#00D084] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] md:h-screen bg-[#111111] relative flex justify-center">
      <div className="w-full max-w-[500px] h-full relative">
        <ReelsFeed 
          reels={reels}
          isLoading={isFetching}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}
