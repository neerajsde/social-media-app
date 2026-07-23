'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetPostQuery } from '@/lib/features/post/postApi';
import { normalizeFeedPost } from '@/lib/post-utils';
import SinglePostView from '@/components/shared/SinglePostView';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useGetPostQuery(id);

  const post = data?.data ? normalizeFeedPost(data.data as unknown as Record<string, unknown>) : undefined;

  return (
    <div className="w-full max-w-2xl border-x border-white/5 bg-[#0a0a0a] min-h-screen pb-20">
      {/* Navigation Header for Desktop */}
      <div className="hidden md:flex sticky top-0 z-30 items-center gap-3 border-b border-white/5 bg-[#0a0a0a]/80 px-4 py-3 backdrop-blur-xl">
        <Link href="/" aria-label="Back to feed">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-4.5 w-4.5" />
          </Button>
        </Link>
        <h1 className="text-lg font-bold font-heading tracking-tight">Post Details</h1>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-medium" />
          <p className="text-sm text-muted-foreground">Loading post details...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-32 space-y-4 px-4 text-center">
          <p className="text-sm text-muted-foreground max-w-xs">
            This post is unavailable or you do not have access to it.
          </p>
          <Link href="/">
            <Button variant="outline" size="sm" className="rounded-xl">
              Back to Home
            </Button>
          </Link>
        </div>
      )}

      {post && <SinglePostView post={post} />}
    </div>
  );
}