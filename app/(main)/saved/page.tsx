'use client';

import { Bookmark, Inbox, Loader2 } from 'lucide-react';
import PostCard from '@/components/shared/PostCard';
import { useGetBookmarkedPostsQuery } from '@/lib/features/post/postApi';
import { Separator } from '@/components/ui/separator';

export default function SavedPage() {
  const { data, isLoading, isError } = useGetBookmarkedPostsQuery({ page: 1, limit: 20 });
  const savedPosts = data?.posts || [];

  return (
    <div className="w-full max-w-2xl border-r border-border/40 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
          Bookmarks
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your private collection of saved content</p>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load bookmarks. Please try again.
          </div>
        ) : savedPosts.length > 0 ? (
          savedPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-24 space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">No bookmarks saved yet</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Tap the bookmark icon on any post details or card to save it here for later retrieval.</p>
          </div>
        )}
      </div>
    </div>
  );
}
