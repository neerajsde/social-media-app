'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/shared/PostCard';
import PostSkeleton from '@/components/shared/PostSkeleton';
import { mockPosts } from '@/lib/mock-data';
import { Sparkles, Clock, ImageIcon, Video as VideoIcon, Music, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';
import { useGetFeedQuery, useCreatePostMutation } from '@/lib/features/post/postApi';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('foryou');
  const [composerText, setComposerText] = useState('');
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Fetch real posts using the getFeed RTK query endpoint
  const { data: feedData, isLoading } = useGetFeedQuery({ page: 1, limit: 20 });
  const [createPost, { isLoading: isPublishing }] = useCreatePostMutation();

  const handlePostCompose = async () => {
    if (!composerText.trim()) return;
    try {
      await createPost({
        postType: 'text',
        content: composerText.trim(),
        visibility: 'public',
        status: 'active',
      }).unwrap();
      
      toast.success('Post created successfully!');
      setComposerText('');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      toast.error('Failed to create post', {
        description: err?.data?.message || 'Something went wrong',
      });
    }
  };

  const handleRouteToCreate = (type: 'image' | 'video' | 'reel') => {
    router.push(`/create?type=${type}`);
  };

  // Determine which posts to render (fallback to mockPosts if API fails or page is empty)
  const realPosts = feedData?.data && feedData.data.length > 0 ? feedData.data : [];
  const postsToRender = realPosts.length > 0 ? realPosts : mockPosts;

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
              disabled={isPublishing}
              className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground resize-none focus:ring-0 min-h-[64px] font-sans disabled:opacity-50"
            />
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <div className="flex items-center gap-1.5 text-brand-dark dark:text-brand-medium">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRouteToCreate('image')}
                  className="w-8 h-8 rounded-full text-brand-medium hover:bg-brand-medium/10"
                  title="Upload Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRouteToCreate('video')}
                  className="w-8 h-8 rounded-full text-brand-medium hover:bg-brand-medium/10"
                  title="Upload Video"
                >
                  <VideoIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRouteToCreate('reel')}
                  className="w-8 h-8 rounded-full text-brand-medium hover:bg-brand-medium/10"
                  title="Create Reel"
                >
                  <Music className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handlePostCompose}
                disabled={!composerText.trim() || isPublishing}
                className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest rounded-full px-5 h-8 text-xs font-semibold"
              >
                {isPublishing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4 pt-2">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : activeTab === 'foryou' ? (
          postsToRender.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <>
            {postsToRender.slice(0, 5).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
