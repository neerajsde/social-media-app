'use client';

import Link from 'next/link';
import { ImageIcon, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useGetPostQuery } from '@/lib/features/post/postApi';
import { getMediaUrl } from '@/lib/media-url';
import { Skeleton } from '@/components/ui/skeleton';

interface SharedPostCardProps {
  postId: string;
}

export default function SharedPostCard({ postId }: SharedPostCardProps) {
  const { data, isLoading, error } = useGetPostQuery(postId);
  const post = data?.data;

  if (isLoading) {
    return (
      <Card className="w-[260px] max-w-full border border-border bg-card/45 backdrop-blur-md">
        <CardContent className="p-3 space-y-3">
          <Skeleton className="w-full h-32 rounded-lg bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-3 w-full bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !post) {
    return (
      <Card className="w-[260px] max-w-full border border-destructive/20 bg-destructive/5 backdrop-blur-md">
        <CardContent className="p-3 text-center text-xs text-muted-foreground">
          Post unavailable or deleted.
        </CardContent>
      </Card>
    );
  }

  const postImage = post.images?.[0] || post.video?.thumbnail || post.thumbnailUrl;
  const authorName = post.author?.username || 'user';

  return (
    <Card className="w-[260px] max-w-full overflow-hidden border border-border/80 bg-gradient-to-b from-card to-card/75 shadow-md hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-0">
        {postImage ? (
          <div className="relative w-full h-32 bg-black/40 overflow-hidden">
            <img
              src={getMediaUrl(postImage)}
              alt="Shared post"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="w-full h-12 bg-muted/30 border-b border-border/40 flex items-center justify-center text-muted-foreground gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Text Post</span>
          </div>
        )}

        <div className="p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs font-bold text-foreground">@{authorName}</span>
            {post.author?.isVerified && (
              <svg className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            )}
          </div>

          {post.content && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 break-words">
              {post.content}
            </p>
          )}

          <Link href={`/post/${post.id}`} className="flex items-center justify-between text-xs font-bold text-brand-medium hover:text-brand-dark hover:underline transition-colors mt-1">
            <span>View Post</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
