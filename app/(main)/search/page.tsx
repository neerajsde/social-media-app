'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, X, Users, FileText, Hash, Clock, Loader2, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/shared/PostCard';
import { formatCount } from '@/lib/mock-data';
import { useAppSelector, useDebouncedValue } from '@/lib/hooks';
import {
  useSearchQuery,
  useGetRecentSearchesQuery,
  useRemoveRecentSearchMutation,
} from '@/lib/features/search/searchApi';
import type { Post, SearchPostResult, SearchTagResult, SearchTrendingResult, SearchUserResult } from '@/lib/types';

const DEBOUNCE_MS = 400;
type SearchFilter = 'all' | 'posts' | 'people' | 'tags';

function mapSearchPostToPost(item: SearchPostResult): Post {
  return {
    id: item.id,
    postType: item.type,
    content: item.content,
    visibility: 'public',
    status: 'active',
    images: item.images,
    likesCount: item.likeCount,
    commentsCount: item.commentCount,
    sharesCount: 0,
    viewsCount: item.viewCount,
    createdAt: item.createdAt,
    tags: item.tags,
    author: item.author,
  };
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const debouncedQuery = useDebouncedValue(query.trim(), DEBOUNCE_MS);
  const hasQuery = debouncedQuery.length > 0;

  const showPeople = filter === 'all' || filter === 'people';
  const showPosts = filter === 'all' || filter === 'posts';
  const showTags = filter === 'all' || filter === 'tags';

  const { data: trendingData, isLoading: trendingLoading } = useSearchQuery(
    { type: 'trending', limit: 10 },
    { skip: hasQuery }
  );

  const { data: recentData, isLoading: recentLoading } = useGetRecentSearchesQuery(10, {
    skip: hasQuery || !isAuthenticated,
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useSearchQuery(
    { q: debouncedQuery, type: 'account', page: 1, limit: 20 },
    { skip: !hasQuery || !showPeople }
  );

  const {
    data: postsData,
    isLoading: postsLoading,
    isFetching: postsFetching,
  } = useSearchQuery(
    { q: debouncedQuery, type: 'posts', page: 1, limit: 20 },
    { skip: !hasQuery || !showPosts }
  );

  const {
    data: tagsData,
    isLoading: tagsLoading,
    isFetching: tagsFetching,
  } = useSearchQuery(
    { q: debouncedQuery, type: 'tags', page: 1, limit: 20 },
    { skip: !hasQuery || !showTags }
  );

  const [removeRecentSearch] = useRemoveRecentSearchMutation();

  const users = (usersData?.data ?? []) as SearchUserResult[];
  const posts = ((postsData?.data ?? []) as SearchPostResult[]).map(mapSearchPostToPost);
  const tags = (tagsData?.data ?? []) as SearchTagResult[];
  const trending = (trendingData?.data ?? []) as SearchTrendingResult[];
  const recentSearches = recentData?.data ?? [];

  const isSearching =
    hasQuery &&
    ((showPeople && (usersLoading || usersFetching)) ||
      (showPosts && (postsLoading || postsFetching)) ||
      (showTags && (tagsLoading || tagsFetching)));

  const hasResults =
    (showPeople && users.length > 0) ||
    (showPosts && posts.length > 0) ||
    (showTags && tags.length > 0);

  const handleRemoveRecent = async (id: string) => {
    try {
      await removeRecentSearch(id).unwrap();
    } catch {
      // list refreshes via RTK Query cache invalidation on success
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border p-4 space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, people, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
              onClick={() => setQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as SearchFilter)}>
          <TabsList className="w-full bg-transparent justify-start rounded-none p-0 h-auto gap-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'posts', icon: FileText, label: 'Posts' },
              { value: 'people', icon: Users, label: 'People' },
              { value: 'tags', icon: Hash, label: 'Tags' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-full px-4 py-1.5 text-xs data-[state=active]:bg-brand-dark data-[state=active]:text-brand-lightest dark:data-[state=active]:bg-brand-medium dark:data-[state=active]:text-brand-darkest"
              >
                {Icon && <Icon className="w-3.5 h-3.5 mr-1" />}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4">
        {!hasQuery ? (
          <div className="space-y-6">
            {(recentLoading || recentSearches.length > 0) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Recent</span>
                </div>
                {recentLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  recentSearches.map((item) => (
                    <Card key={item.id ?? item.query} className="border-border/50">
                      <CardContent className="p-3 flex items-center gap-3">
                        <button
                          type="button"
                          className="flex-1 flex items-center gap-3 text-left min-w-0"
                          onClick={() => setQuery(item.query)}
                        >
                          <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">{item.query}</span>
                        </button>
                        {item.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground"
                            onClick={() => handleRemoveRecent(item.id!)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Trending now</span>
              </div>
              {trendingLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : trending.length > 0 ? (
                trending.map((item) => (
                  <Card
                    key={item.query}
                    className="border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setQuery(item.query)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Hash className="w-4 h-4 text-brand-medium" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">{item.query}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatCount(Math.round(item.score))} searches
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No trending searches yet. Start exploring!
                </p>
              )}
            </div>
          </div>
        ) : isSearching ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {showPeople && users.length > 0 && (
              <div className="space-y-3">
                {filter === 'all' && (
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> People
                  </h3>
                )}
                {users.map((user) => (
                  <Card key={user.id} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Link href={`/profile/${user.username}`}>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.first_name?.[0] || user.username[0]}</AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/${user.username}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {user.first_name} {user.last_name}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">
                        Follow
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {showTags && tags.length > 0 && (
              <div className="space-y-3">
                {filter === 'all' && (
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mt-4">
                    <Hash className="w-4 h-4" /> Tags
                  </h3>
                )}
                {tags.map((tag) => (
                  <Card
                    key={tag.id}
                    className="border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setQuery(tag.tag)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Hash className="w-4 h-4 text-brand-medium" />
                      <div className="flex-1">
                        <span className="text-sm font-medium">#{tag.tag}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatCount(tag._count.posts)} posts
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {showPosts && posts.length > 0 && (
              <div className="space-y-4">
                {filter === 'all' && (
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mt-4">
                    <FileText className="w-4 h-4" /> Posts
                  </h3>
                )}
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {!hasResults && (
              <div className="text-center py-16 space-y-3">
                <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-lg font-medium">No results found</p>
                <p className="text-sm text-muted-foreground">Try searching for something else</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
