'use client';

import { useState } from 'react';
import { Search as SearchIcon, X, Users, FileText, Hash, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import PostCard from '@/components/shared/PostCard';
import { mockPosts, mockUsers, trendingTags, formatCount } from '@/lib/mock-data';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredPosts = mockPosts.filter((p) => p.content?.toLowerCase().includes(query.toLowerCase()) || p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase())));
  const filteredUsers = mockUsers.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()) || u.first_name?.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search Header */}
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
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground" onClick={() => setQuery('')}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full bg-transparent justify-start rounded-none p-0 h-auto gap-1">
            {[
              { value: 'all', label: 'All' },
              { value: 'posts', icon: FileText, label: 'Posts' },
              { value: 'people', icon: Users, label: 'People' },
              { value: 'tags', icon: Hash, label: 'Tags' },
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="rounded-full px-4 py-1.5 text-xs data-[state=active]:bg-brand-dark data-[state=active]:text-brand-lightest dark:data-[state=active]:bg-brand-medium dark:data-[state=active]:text-brand-darkest">
                {Icon && <Icon className="w-3.5 h-3.5 mr-1" />}
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4">
        {!query ? (
          /* Recent / Trending */
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Trending now</span>
            </div>
            {trendingTags.map(({ tag, postCount }) => (
              <Link key={tag} href={`/search?q=${tag}`} onClick={() => setQuery(tag)}>
                <Card className="border-border/50 hover:bg-accent/50 transition-colors cursor-pointer mb-2">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Hash className="w-4 h-4 text-brand-medium" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">#{tag}</span>
                      <span className="text-xs text-muted-foreground ml-2">{formatCount(postCount)} posts</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <>
            {/* People results */}
            {(filter === 'all' || filter === 'people') && filteredUsers.length > 0 && (
              <div className="space-y-3">
                {filter === 'all' && <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5"><Users className="w-4 h-4" /> People</h3>}
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <Link href={`/profile/${user.username}`}><Avatar className="w-10 h-10"><AvatarImage src={user.avatarUrl} /><AvatarFallback>{user.first_name?.[0]}</AvatarFallback></Avatar></Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:underline">{user.first_name} {user.last_name}</Link>
                        <p className="text-xs text-muted-foreground">@{user.username} · {formatCount(user.followersCount || 0)} followers</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs rounded-full">Follow</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Post results */}
            {(filter === 'all' || filter === 'posts') && filteredPosts.length > 0 && (
              <div className="space-y-4">
                {filter === 'all' && <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5 mt-4"><FileText className="w-4 h-4" /> Posts</h3>}
                {filteredPosts.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {filteredUsers.length === 0 && filteredPosts.length === 0 && (
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
