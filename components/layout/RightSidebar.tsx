'use client';

import Link from 'next/link';
import { TrendingUp, UserPlus, Hash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockUsers, trendingTags, formatCount } from '@/lib/mock-data';

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-[320px] shrink-0 sticky top-0 h-screen overflow-y-auto py-4 pr-4 pl-2 space-y-4">
      {/* Trending Topics */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-medium" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {trendingTags.slice(0, 5).map(({ tag, postCount }) => (
            <Link key={tag} href={`/search?q=${tag}&type=tags`} className="flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-medium group-hover:text-brand-dark dark:group-hover:text-brand-medium transition-colors">{tag}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatCount(postCount)} posts</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-brand-medium" />
            Who to Follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {mockUsers.slice(0, 4).map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link href={`/profile/${user.username}`}>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.avatarUrl} alt={user.username} />
                  <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs">{user.first_name?.[0]}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:underline truncate block">{user.first_name} {user.last_name}</Link>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs rounded-full shrink-0 border-brand-dark/20 text-brand-dark hover:bg-brand-dark hover:text-brand-lightest dark:border-brand-medium/30 dark:text-brand-medium dark:hover:bg-brand-medium dark:hover:text-brand-darkest">
                Follow
              </Button>
            </div>
          ))}
          <Separator />
          <Link href="/explore" className="text-xs text-brand-dark dark:text-brand-medium hover:underline font-medium">
            Show more
          </Link>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="px-2 text-xs text-muted-foreground space-y-1">
        <div className="flex flex-wrap gap-x-2 gap-y-0.5">
          <Link href="#" className="hover:underline">Terms</Link>
          <Link href="#" className="hover:underline">Privacy</Link>
          <Link href="#" className="hover:underline">Cookies</Link>
          <Link href="#" className="hover:underline">About</Link>
        </div>
        <p>NexusPlay {new Date().getFullYear()}</p>
      </div>
    </aside>
  );
}
