'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Repeat2, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/lib/hooks';
import { formatCount, timeAgo } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { cn } from '@/lib/utils';
import AuthDialog from '@/components/shared/AuthDialog';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLike = () => {
    if (!isAuthenticated) { setShowAuthDialog(true); return; }
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleBookmark = () => {
    if (!isAuthenticated) { setShowAuthDialog(true); return; }
    setBookmarked(!bookmarked);
  };

  const handleProtectedAction = () => {
    if (!isAuthenticated) { setShowAuthDialog(true); return; }
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4 sm:p-5">
          {/* Author row */}
          <div className="flex items-start gap-3 mb-3">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="w-10 h-10 ring-1 ring-border hover:ring-brand-medium transition-all">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.username} />
                <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-sm">{post.author.first_name?.[0] || post.author.username[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Link href={`/profile/${post.author.username}`} className="text-sm font-semibold hover:underline truncate">
                  {post.author.first_name} {post.author.last_name}
                </Link>
                {post.author.isVerified && (
                  <svg className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link href={`/profile/${post.author.username}`} className="hover:underline">@{post.author.username}</Link>
                <span>·</span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground" />}>
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleProtectedAction}>Report post</DropdownMenuItem>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem onClick={handleProtectedAction}>Not interested</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {post.content && (
            <Link href={`/post/${post.id}`}>
              <p className="text-sm leading-relaxed mb-3 whitespace-pre-line hover:text-foreground/80 transition-colors">{post.content}</p>
            </Link>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${tag}&type=tags`}>
                  <Badge variant="secondary" className="text-xs font-normal hover:bg-brand-dark/10 dark:hover:bg-brand-medium/20 cursor-pointer transition-colors">
                    #{tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <Link href={`/post/${post.id}`}>
              <div className={cn(
                'rounded-xl overflow-hidden mb-3',
                post.images.length === 1 && 'aspect-[16/10]',
                post.images.length >= 2 && 'grid grid-cols-2 gap-0.5',
              )}>
                {post.images.slice(0, 4).map((img, i) => (
                  <div key={i} className={cn(
                    'relative overflow-hidden bg-muted',
                    post.images!.length === 1 && 'aspect-[16/10]',
                    post.images!.length >= 2 && 'aspect-square',
                  )}>
                    <img
                      src={img}
                      alt={`Post image ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {i === 3 && post.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">+{post.images!.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Link>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 px-2 gap-1.5 text-xs', liked && 'text-red-500 hover:text-red-600')}
                onClick={handleLike}
              >
                <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
                <span>{formatCount(likeCount)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs text-muted-foreground hover:text-brand-dark dark:hover:text-brand-medium" nativeButton={false} render={<Link href={`/post/${post.id}`} />}>
                <MessageCircle className="w-4 h-4" />
                <span>{formatCount(post.commentsCount)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs text-muted-foreground" onClick={handleProtectedAction}>
                <Repeat2 className="w-4 h-4" />
                <span>{formatCount(post.sharesCount)}</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-xs text-muted-foreground" onClick={handleProtectedAction}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {formatCount(post.viewsCount)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-8 w-8 p-0', bookmarked && 'text-brand-dark dark:text-brand-medium')}
                onClick={handleBookmark}
              >
                <Bookmark className={cn('w-4 h-4', bookmarked && 'fill-current')} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
