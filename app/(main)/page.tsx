'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PostCard from '@/components/shared/PostCard';
import PostSkeleton from '@/components/shared/PostSkeleton';
import {
  Sparkles,
  Clock,
  ImageIcon,
  Video as VideoIcon,
  Music,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';
import { useGetFeedQuery, useCreatePostMutation } from '@/lib/features/post/postApi';
import { normalizeFeedPost } from '@/lib/post-utils';
import type { FeedType, Post } from '@/lib/types';

const FEED_LIMIT = 10;

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FeedType>('foryou');
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [composerText, setComposerText] = useState('');
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);

  const {
    data: feedData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetFeedQuery({ page, limit: FEED_LIMIT, type: activeTab }, { skip: !isInitialized });

  const [createPost, { isLoading: isPublishing }] = useCreatePostMutation();

  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    if (!feedData?.data) return;

    const normalized = feedData.data.map((p) =>
      normalizeFeedPost(p as unknown as Record<string, unknown>)
    );

    if (page === 1) {
      setPosts(normalized);
      return;
    }

    setPosts((prev) => {
      const seen = new Set(prev.map((p) => p.id));
      const next = normalized.filter((p) => !seen.has(p.id));
      return next.length > 0 ? [...prev, ...next] : prev;
    });
  }, [feedData, page]);

  const hasMore = feedData?.pagination?.hasMore ?? false;

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
      setPage(1);
      refetch();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message || 'Something went wrong';
      toast.error('Failed to create post', { description: message });
    }
  };

  const handleRouteToCreate = (type: 'image' | 'video' | 'reel') => {
    router.push(`/create?type=${type}`);
  };

  const handleLoadMore = () => {
    if (hasMore && !isFetching) setPage((p) => p + 1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as FeedType);
  };

  return (
    <div className="w-full max-w-2xl mx-auto border-x border-border/40 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl">
        <div className="px-3 sm:px-4 py-3">
          <h1 className="text-base sm:text-lg font-bold font-heading tracking-tight">Home</h1>
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full tab-line">
          <TabsList className="w-full bg-transparent justify-stretch rounded-none border-b border-border/60 p-0 h-auto gap-0">
            <TabsTrigger
              value="foryou"
              className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground data-active:text-foreground gap-1 sm:gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">For You</span>
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground data-active:text-foreground gap-1 sm:gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Following</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Feed Composer */}
      {isAuthenticated && user && (
        <div className="p-4 mb-4 mx-3 sm:mx-4 border border-border/20 bg-card rounded-2xl flex gap-3 shadow-sm">
          <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border border-border shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs">
              {user.first_name?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
            <textarea
              placeholder={`What's happening today, ${user.first_name || user.username}?`}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              disabled={isPublishing}
              rows={2}
              className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground resize-none focus:ring-0 min-h-[56px] sm:min-h-[64px] font-sans disabled:opacity-50"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-border/50 pt-2.5 sm:pt-3">
              <div className="flex items-center gap-0.5 sm:gap-1.5 text-brand-dark dark:text-brand-medium">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRouteToCreate('image')}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-brand-medium hover:bg-brand-medium/10"
                  title="Upload Image"
                  aria-label="Upload image"
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRouteToCreate('video')}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-brand-medium hover:bg-brand-medium/10"
                  title="Upload Video"
                  aria-label="Upload video"
                >
                  <VideoIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRouteToCreate('reel')}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-brand-medium hover:bg-brand-medium/10"
                  title="Create Reel"
                  aria-label="Create reel"
                >
                  <Music className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={handlePostCompose}
                disabled={!composerText.trim() || isPublishing}
                className="w-full sm:w-auto bg-[#05a85c] hover:bg-[#049652] text-white rounded-xl px-6 h-9 sm:h-9 text-sm font-semibold shrink-0"
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
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {isLoading && page === 1 ? (
          <div className="space-y-4 pt-2">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-4 px-4">
            <p className="text-sm text-muted-foreground">Could not load your feed.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 space-y-4 px-4">
            {activeTab === 'following' ? (
              <>
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-lg font-medium">Your following feed is empty</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Follow creators to see their latest posts here.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/explore" />}
                >
                  Explore creators
                </Button>
              </>
            ) : (
              <>
                <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-lg font-medium">No posts yet</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Be the first to share something, or check back later.
                </p>
                {isAuthenticated && (
                  <Button
                    size="sm"
                    onClick={() => router.push('/create')}
                    className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest"
                  >
                    Create a post
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-2 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  className="w-full sm:w-auto min-w-[140px] gap-2"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
