'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, UserPlus, Hash, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetTrendingTagsQuery } from '@/lib/features/post/postApi';
import { useGetSuggestedUsersQuery } from '@/lib/features/user/userApi';
import { useAppSelector } from '@/lib/hooks';
import AuthDialog from '@/components/shared/AuthDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RightSidebar() {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: trendingData, isLoading: isLoadingTags } = useGetTrendingTagsQuery({ limit: 10 });
  const { data: suggestedData, isLoading: isLoadingUsers } = useGetSuggestedUsersQuery({ limit: 10 }, { skip: !isAuthenticated }); // or fetch always

  const tags = trendingData?.tags || [];
  const users = suggestedData?.users || [];

  const formatCount = (count: number) => Intl.NumberFormat('en-US', { notation: 'compact' }).format(count);

  const handleFollowClick = (id: string, username: string) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
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
    <>
      <aside className="hidden lg:flex flex-col w-[320px] shrink-0 sticky top-0 h-screen overflow-y-auto py-4 pr-4 pl-3 gap-4">

        {/* Trending Topics */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/40 bg-gradient-to-r from-brand-dark/8 to-transparent">
            <div className="w-7 h-7 rounded-lg bg-brand-dark/10 dark:bg-brand-medium/15 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Trending Topics</h2>
          </div>
          <div className="p-3 space-y-0.5 max-h-[240px] overflow-y-auto overscroll-contain">
            {isLoadingTags ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading tags...</div>
            ) : tags.length > 0 ? (
              tags.map(({ tag, postCount }: { tag: string; postCount: number }, index: number) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}&type=tags`}
                  className="group flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-muted-foreground/50 w-4 text-right tabular-nums">{index + 1}</span>
                    <div>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3 text-brand-medium shrink-0" />
                        <span className="text-sm font-semibold text-foreground group-hover:text-brand-dark dark:group-hover:text-brand-medium transition-colors">{tag}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatCount(postCount)} posts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-brand-medium group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">No trending tags</div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-border/40 bg-accent/20">
            <Link href="/explore" className="text-xs font-semibold text-brand-dark dark:text-brand-medium hover:underline">
              View all trending &rarr;
            </Link>
          </div>
        </div>

        {/* Who to Follow */}
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/40 bg-gradient-to-r from-brand-dark/8 to-transparent">
            <div className="w-7 h-7 rounded-lg bg-brand-dark/10 dark:bg-brand-medium/15 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium" />
            </div>
            <h2 className="text-sm font-bold text-foreground">Who to Follow</h2>
          </div>
          <div className="p-3 space-y-1 max-h-[240px] overflow-y-auto overscroll-contain">
            {isLoadingUsers ? (
              <div className="py-8 text-center text-xs text-muted-foreground">Loading users...</div>
            ) : users.length > 0 ? (
              users.map((user: any) => {
                const isFollowed = followedUsers.has(user.id);
                return (
                  <div
                    key={user.id}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-accent/50 transition-colors"
                  >
                    <Link href={`/profile/${user.username}`} className="shrink-0">
                      <Avatar className="w-9 h-9 ring-2 ring-border/50 group-hover:ring-brand-medium/50 transition-all">
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-brand-dark/20 to-brand-medium/20 text-brand-dark dark:text-brand-medium text-xs font-bold uppercase">
                          {user.first_name?.[0] || user.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Link href={`/profile/${user.username}`} className="text-sm font-semibold hover:text-brand-dark dark:hover:text-brand-medium truncate block transition-colors leading-tight">
                          {user.first_name} {user.last_name}
                        </Link>
                        {user.isVerified && (
                          <svg className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isFollowed ? 'secondary' : 'outline'}
                      onClick={() => handleFollowClick(user.id, user.username)}
                      className={cn(
                        'h-7 text-xs rounded-full shrink-0 font-semibold transition-all duration-200',
                        isFollowed
                          ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-medium border-brand-dark/20'
                          : 'border-brand-dark/30 text-brand-dark hover:bg-brand-dark hover:text-white dark:border-brand-medium/30 dark:text-brand-medium dark:hover:bg-brand-medium dark:hover:text-brand-darkest'
                      )}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">No suggestions</div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-border/40 bg-accent/20">
            <Link href="/explore" className="text-xs font-semibold text-brand-dark dark:text-brand-medium hover:underline">
              Show more &rarr;
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-2 text-[11px] text-muted-foreground/60 space-y-1">
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {['Terms', 'Privacy', 'Cookies', 'About'].map((item) => (
              <Link key={item} href="#" className="hover:text-muted-foreground transition-colors hover:underline">{item}</Link>
            ))}
          </div>
          <p>NexusPlay &copy; {new Date().getFullYear()}</p>
        </div>
      </aside>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
