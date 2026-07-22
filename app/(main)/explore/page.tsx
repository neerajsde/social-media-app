'use client';

import { useState } from 'react';
import { Compass, TrendingUp, Users, Hash, Flame } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PostCard from '@/components/shared/PostCard';
import { useGetFeedQuery, useGetTrendingTagsQuery } from '@/lib/features/post/postApi';
import { useGetSuggestedUsersQuery } from '@/lib/features/user/userApi';
import { useAppSelector } from '@/lib/hooks';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ExplorePage() {
  const [tab, setTab] = useState('trending');
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: feedResponse, isLoading: isLoadingPosts } = useGetFeedQuery({ limit: 20, type: 'trending' });
  const { data: suggestedData, isLoading: isLoadingUsers } = useGetSuggestedUsersQuery({ limit: 20 }, { skip: !isAuthenticated });
  const { data: trendingData, isLoading: isLoadingTags } = useGetTrendingTagsQuery({ limit: 20 });

  const posts = Array.isArray(feedResponse?.data) ? feedResponse.data : (feedResponse?.data as any)?.posts || [];
  const users = suggestedData?.users || [];
  const tags = trendingData?.tags || [];

  const formatCount = (count: number) => Intl.NumberFormat('en-US', { notation: 'compact' }).format(count);

  const handleFollowClick = (id: string, username: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success(`Unfollowed @${username}`);
      } else {
        next.add(id);
        toast.success(`Followed @${username}`);
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-2xl border-r border-border/40 min-h-screen">
      <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center gap-2 px-4 py-3">
          <Compass className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
          <h1 className="text-lg font-bold tracking-tight">Explore</h1>
        </div>
        <Tabs value={tab} onValueChange={setTab} className="tab-line">
          <TabsList className="w-full bg-transparent justify-start rounded-none border-b border-border/60 p-0 px-4 h-auto gap-0">
            {[
              { value: 'trending', icon: Flame, label: 'Trending' },
              { value: 'people', icon: Users, label: 'People' },
              { value: 'tags', icon: Hash, label: 'Tags' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 py-3 text-sm font-medium text-muted-foreground data-active:text-foreground gap-1.5"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'trending' && (
          <div className="space-y-4">
            {isLoadingPosts ? (
              <div className="py-8 text-center text-muted-foreground">Loading posts...</div>
            ) : posts.length > 0 ? (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            ) : (
              <div className="py-8 text-center text-muted-foreground">No trending posts found</div>
            )}
          </div>
        )}

        {tab === 'people' && (
          <div className="space-y-3">
            {isLoadingUsers ? (
              <div className="py-8 text-center text-muted-foreground">Loading users...</div>
            ) : users.length > 0 ? (
              users.map((user: any) => {
                const isFollowed = followedUsers.has(user.id);
                return (
                  <Card key={user.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Link href={`/profile/${user.username}`}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={user.avatarUrl} alt={user.username} />
                          <AvatarFallback className="bg-brand-medium/20 text-brand-dark uppercase">{user.first_name?.[0] || user.username?.[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${user.username}`} className="font-semibold text-sm hover:underline flex items-center gap-1">
                          {user.first_name} {user.last_name}
                          {user.isVerified && <svg className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>}
                        </Link>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.bio}</p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-xs text-muted-foreground">{formatCount(user.followersCount || 0)} followers</p>
                        <Button 
                          variant={isFollowed ? 'secondary' : 'outline'} 
                          size="sm" 
                          onClick={() => handleFollowClick(user.id, user.username)}
                          className={`h-7 text-xs rounded-full ${
                            isFollowed 
                              ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-medium border-brand-dark/20' 
                              : 'border-brand-dark/30 text-brand-dark hover:bg-brand-dark hover:text-white dark:border-brand-medium/30 dark:text-brand-medium dark:hover:bg-brand-medium dark:hover:text-brand-darkest'
                          }`}
                        >
                          {isFollowed ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground">No suggested users found</div>
            )}
          </div>
        )}

        {tab === 'tags' && (
          <div className="space-y-2">
            {isLoadingTags ? (
              <div className="py-8 text-center text-muted-foreground">Loading tags...</div>
            ) : tags.length > 0 ? (
              tags.map(({ tag, postCount }: { tag: string; postCount: number }, i: number) => (
                <Link key={tag} href={`/search?q=${tag}&type=tags`}>
                  <Card className="border-border/50 hover:bg-accent/50 transition-colors cursor-pointer mb-2">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-dark/10 dark:bg-brand-medium/20 flex items-center justify-center">
                          <Hash className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">#{tag}</p>
                          <p className="text-xs text-muted-foreground">{formatCount(postCount)} posts</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">#{i + 1} Trending</Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">No trending tags found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
