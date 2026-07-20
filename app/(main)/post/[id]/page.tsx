'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, Heart, Repeat2, Bookmark, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import PostCard from '@/components/shared/PostCard';
import { mockPosts, formatCount, timeAgo } from '@/lib/mock-data';
import { useAppSelector } from '@/lib/hooks';
import AuthDialog from '@/components/shared/AuthDialog';
import { toast } from 'sonner';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [commentContent, setCommentContent] = useState('');

  const post = mockPosts.find((p) => p.id === id) || mockPosts[0];

  const [comments, setComments] = useState([
    {
      id: 'c1',
      content: 'Absolutely stunning capture! What camera body and lens did you use for this?',
      likesCount: 24,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      author: {
        id: 'user_alex',
        username: 'alex_wanderer',
        first_name: 'Alex',
        last_name: 'Morgan',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      },
    },
    {
      id: 'c2',
      content: 'This is gorgeous! The lighting is perfect.',
      likesCount: 12,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      author: {
        id: 'user_emma',
        username: 'emma_designs',
        first_name: 'Emma',
        last_name: 'Wilson',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      },
    },
  ]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    if (!commentContent.trim()) return;

    const newComment = {
      id: Math.random().toString(),
      content: commentContent,
      likesCount: 0,
      createdAt: new Date().toISOString(),
      author: {
        id: 'current_user',
        username: 'visitor_user',
        first_name: 'Guest',
        last_name: 'User',
        avatarUrl: '',
      },
    };

    setComments([newComment, ...comments]);
    setCommentContent('');
    toast.success('Comment posted successfully');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-sm font-bold">Post Details</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Post Card */}
        <PostCard post={post} />

        <Separator />

        {/* Comment Input */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs">U</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[80px] resize-none border-none focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground bg-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-border/50">
                <Button type="submit" size="sm" className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest rounded-full px-4 text-xs font-semibold">
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Comment
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 px-1">
            <MessageSquare className="w-4 h-4" />
            Comments ({comments.length})
          </h3>

          {comments.map((comment) => (
            <Card key={comment.id} className="border-border/40 bg-card/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${comment.author.username}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author.avatarUrl} alt={comment.author.username} />
                      <AvatarFallback className="bg-brand-medium/10 text-brand-dark text-xs">{comment.author.first_name?.[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/profile/${comment.author.username}`} className="text-xs font-semibold hover:underline">
                        {comment.author.first_name} {comment.author.last_name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.content}</p>

                    <div className="flex items-center gap-4 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowAuthDialog(true);
                          } else {
                            toast.success('Liked comment!');
                          }
                        }}
                        className="h-6 px-1.5 gap-1 text-[11px] text-muted-foreground hover:text-red-500"
                      >
                        <Heart className="w-3 h-3" />
                        <span>{formatCount(comment.likesCount)}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!isAuthenticated) {
                            setShowAuthDialog(true);
                          } else {
                            toast.info('Reply feature coming soon!');
                          }
                        }}
                        className="h-6 px-1.5 text-[11px] text-muted-foreground"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
