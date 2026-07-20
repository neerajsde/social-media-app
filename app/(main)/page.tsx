'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/shared/PostCard';
import PostSkeleton from '@/components/shared/PostSkeleton';
import { mockPosts } from '@/lib/mock-data';
import { Sparkles, Clock } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('foryou');

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold hidden md:block">Home</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent justify-start rounded-none border-b-0 p-0 h-auto">
            <TabsTrigger
              value="foryou"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark dark:data-[state=active]:border-brand-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-sm font-medium data-[state=active]:text-foreground"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              For You
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark dark:data-[state=active]:border-brand-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-sm font-medium data-[state=active]:text-foreground"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed */}
      <div className="p-4 space-y-4">
        {activeTab === 'foryou' ? (
          mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <>
            {mockPosts.slice(0, 3).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </>
        )}

        {/* Load more skeleton */}
        <div className="space-y-4 pt-2">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    </div>
  );
}
