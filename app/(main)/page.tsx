'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/shared/PostCard';
import PostSkeleton from '@/components/shared/PostSkeleton';
import { mockPosts } from '@/lib/mock-data';
import { Sparkles, Clock, Image, Video, Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('foryou');
  const [composerText, setComposerText] = useState('');
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const handlePostCompose = () => {
    if (!composerText.trim()) return;
    toast.success('Post created successfully!');
    setComposerText('');
  };

  return (
    <div className="max-w-2xl mx-auto border-r border-[#6B9071]/10 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold font-heading">Home</h1>
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

      {/* Feed Composer */}
      {isAuthenticated && user && (
        <div className="p-4 border-b border-border bg-card/15 flex gap-3">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs">{user.first_name?.[0] || user.username[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <textarea
              placeholder="What's happening today? Share insights, images or updates..."
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground resize-none focus:ring-0 min-h-[64px] font-sans"
            />
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-1.5 text-brand-dark dark:text-brand-medium">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-brand-medium hover:bg-brand-medium/10">
                  <Image className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-brand-medium hover:bg-brand-medium/10">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-brand-medium hover:bg-brand-medium/10">
                  <Music className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handlePostCompose}
                disabled={!composerText.trim()}
                className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest rounded-full px-5 h-8 text-xs font-semibold"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}

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
