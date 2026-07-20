'use client';

import { Bookmark, Inbox } from 'lucide-react';
import PostCard from '@/components/shared/PostCard';
import { mockPosts } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

export default function SavedPage() {
  // Let us mock the user having saved the first two posts
  const savedPosts = mockPosts.slice(0, 2).map((post) => ({ ...post, isBookmarked: true }));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
          Bookmarks
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your private collection of saved content</p>
      </div>

      <div className="p-4 space-y-4">
        {savedPosts.length > 0 ? (
          savedPosts.map((post) => (
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
