'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetReelsQuery, useGetPostQuery } from '@/lib/features/post/postApi';
import { normalizeFeedPost } from '@/lib/post-utils';
import ReelsFeed from '@/components/reels/ReelsFeed';
import ReelSkeleton from '@/components/skeletons/ReelSkeleton';
import type { Post } from '@/lib/types';

function ReelsPageContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const [page, setPage] = useState(1);
  const [reels, setReels] = useState<Post[]>([]);
  
  const { data: initialPostData, isLoading: initialLoading } = useGetPostQuery(initialId || '', { 
    skip: !initialId 
  });

  const { data, isLoading, isFetching } = useGetReelsQuery({ page, limit: 10 });

  useEffect(() => {
    let baseReels: Post[] = [];
    
    // Inject initial post if fetched
    if (initialPostData?.data) {
      const initialPost = normalizeFeedPost(initialPostData.data as unknown as Record<string, unknown>);
      if (initialPost) {
        baseReels.push(initialPost);
      }
    }

    if (data?.data) {
      const rawPosts = data.data as any;
      const normalized = Array.isArray(rawPosts) ? rawPosts : (rawPosts.posts || []);
      
      if (page === 1) {
        // Filter out initial post from normalized feed to avoid duplicates
        const filtered = normalized.filter((p: any) => p.id !== initialId);
        setReels([...baseReels, ...filtered]);
      } else {
        setReels((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const next = normalized.filter((p: any) => !seen.has(p.id));
          return [...prev, ...next];
        });
      }
    } else if (baseReels.length > 0 && reels.length === 0) {
      setReels(baseReels);
    }
  }, [data, page, initialPostData, initialId]);

  const totalPosts = data?.total || reels.length;
  const hasMore = reels.length < totalPosts;

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage(p => p + 1);
    }
  };

  const showLoading = (isLoading || (!!initialId && initialLoading)) && page === 1;

  if (showLoading) {
    return (
      <div className="w-full h-[100dvh] md:h-[calc(100vh-2rem)] flex bg-black md:bg-transparent snap-y snap-mandatory overflow-hidden">
        <ReelSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100dvh-64px)] md:h-screen bg-[#111111] relative flex justify-center overflow-hidden">
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

export default function ReelsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-[100dvh] md:h-[calc(100vh-2rem)] flex bg-black md:bg-transparent snap-y snap-mandatory overflow-hidden">
        <ReelSkeleton />
      </div>
    }>
      <ReelsPageContent />
    </Suspense>
  );
}
