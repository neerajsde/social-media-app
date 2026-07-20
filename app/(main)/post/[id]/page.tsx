'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PostCard from '@/components/shared/PostCard';
import PostMediaViewer from '@/components/shared/PostMediaViewer';
import AuthDialog from '@/components/shared/AuthDialog';
import { useAppSelector } from '@/lib/hooks';
import { useCommentOnPostMutation, useGetPostCommentsQuery, useGetPostQuery } from '@/lib/features/post/postApi';
import { normalizeFeedPost } from '@/lib/post-utils';
import { formatCount, timeAgo } from '@/lib/mock-data';
import type { PostAuthor } from '@/lib/types';

type ApiComment = {
  id: string;
  content: string;
  likesCount?: number;
  likeCount?: number;
  createdAt: string;
  user?: PostAuthor;
  author?: PostAuthor;
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [commentContent, setCommentContent] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { data, isLoading, isError } = useGetPostQuery(id);
  const [commentOnPost, { isLoading: isCommenting }] = useCommentOnPostMutation();
  const { data: commentsResponse } = useGetPostCommentsQuery({ postId: id, limit: 50 });
  const post = data?.data ? normalizeFeedPost(data.data as unknown as Record<string, unknown>) : undefined;
  const commentsData = commentsResponse?.data as unknown as { comments?: ApiComment[] } | undefined;
  const comments = commentsData?.comments ?? [];

  const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (!commentContent.trim() || isCommenting) return;

    try {
      await commentOnPost({ postId: id, content: commentContent.trim() }).unwrap();
      setCommentContent('');
    } catch {
      // Keep the comment text available so the user can retry.
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl">
        <Link href="/" aria-label="Back to feed">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-sm font-bold">Post details</h1>
      </div>

      {isLoading && <p className="p-8 text-center text-sm text-muted-foreground">Loading post…</p>}
      {isError && <p className="p-8 text-center text-sm text-muted-foreground">This post is unavailable or you do not have access to it.</p>}

      {post && (
        <div className="space-y-4 p-4">
          <PostCard post={post} showMedia={false} />
          <PostMediaViewer post={post} />
          <Separator />

          <section className="space-y-3">
            <h2 className="flex items-center gap-1.5 px-1 text-sm font-semibold text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              Comments ({formatCount(post.commentsCount)})
            </h2>
            {comments.map((comment) => {
              const author = comment.author ?? comment.user;
              if (!author) return null;
              return (
                <Card key={comment.id} className="border-border/40 bg-card/30">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Link href={`/profile/${author.username}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={author.avatarUrl} alt={author.username} />
                          <AvatarFallback>{author.first_name?.[0] ?? author.username[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{author.first_name ?? author.username} {author.last_name ?? ''}</p>
                        <p className="text-sm text-foreground/90">{comment.content}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {timeAgo(comment.createdAt)} · {formatCount(comment.likesCount ?? comment.likeCount ?? 0)} likes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {comments.length === 0 && <p className="px-1 text-sm text-muted-foreground">No comments yet.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
