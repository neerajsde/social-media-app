'use client';

import { Bookmark, Inbox, Loader2 } from 'lucide-react';
import PostCard from '@/components/shared/PostCard';
import { useGetBookmarkedPostsQuery } from '@/lib/features/post/postApi';
import { Separator } from '@/components/ui/separator';

export default function SavedPage() {
  const { data, isLoading, isError } = useGetBookmarkedPostsQuery({ page: 1, limit: 20 });
  const savedPosts = data?.posts || [];

  return (
    <div className="w-full max-w-2xl border-x border-white/5 bg-[#111111] min-h-screen">
      <div 
        className="sticky top-0 z-20 bg-[#111111]/80 backdrop-blur-2xl border-b border-white/5 cursor-pointer hover:bg-[#111111]/90 transition-all duration-300 group/header"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/5 group-hover/header:bg-white/10 flex items-center justify-center transition-colors">
              <Bookmark className="w-4.5 h-4.5 text-brand-medium" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-heading tracking-tight text-white/90">Bookmarks</h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">Your private collection of saved content</p>
            </div>
          </div>
        </div>
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
