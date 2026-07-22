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
  const { data: suggestedData, isLoading: isLoadingUsers } = useGetSuggestedUsersQuery({ limit: 10 }, { skip: !isAuthenticated });

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
      <aside className="hidden lg:flex flex-col w-[300px] xl:w-[340px] shrink-0 sticky top-0 h-screen overflow-y-auto border-l border-border/40 bg-[#1a1a1a]">
        {/* Inner content with padding */}
        <div className="flex flex-col gap-0 flex-1">

          {/* ─── Trending Topics ─── */}
          <div className="border-b border-border/30">
            <div className="flex items-center gap-2.5 px-5 py-3.5">
              <TrendingUp className="w-4 h-4 text-brand-medium shrink-0" />
              <h2 className="text-sm font-bold text-foreground tracking-tight">Trending Topics</h2>
            </div>
            <div className="max-h-[260px] overflow-y-auto overscroll-contain">
              {isLoadingTags ? (
                <div className="py-8 text-center text-xs text-muted-foreground/50">Loading...</div>
              ) : tags.length > 0 ? (
                tags.map(({ tag, postCount }: { tag: string; postCount: number }, index: number) => (
                  <Link
                    key={tag}
                    href={`/search?q=${tag}&type=tags`}
                    className="group flex items-center justify-between px-5 py-2.5 hover:bg-[#252525] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] font-bold text-muted-foreground/30 w-3 text-right tabular-nums shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-brand-medium/70 shrink-0" />
                          <span className="text-sm font-semibold text-foreground/90 group-hover:text-brand-medium transition-colors truncate">
                            {tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{formatCount(postCount)} posts</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-brand-medium/60 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground/40">No trending tags</div>
              )}
            </div>
            <div className="px-5 py-2.5">
              <Link href="/explore" className="text-xs font-semibold text-brand-medium/80 hover:text-brand-medium transition-colors">
                View all trending →
              </Link>
            </div>
          </div>

          {/* ─── Who to Follow ─── */}
          <div className="border-b border-border/30">
            <div className="flex items-center gap-2.5 px-5 py-3.5">
              <UserPlus className="w-4 h-4 text-brand-medium shrink-0" />
              <h2 className="text-sm font-bold text-foreground tracking-tight">Who to Follow</h2>
            </div>
            <div className="max-h-[280px] overflow-y-auto overscroll-contain">
              {isLoadingUsers ? (
                <div className="py-8 text-center text-xs text-muted-foreground/50">Loading...</div>
              ) : users.length > 0 ? (
                users.map((user: any) => {
                  const isFollowed = followedUsers.has(user.id);
                  return (
                    <div
                      key={user.id}
                      className="group flex items-center gap-3 px-5 py-2.5 hover:bg-[#252525] transition-colors"
                    >
                      <Link href={`/profile/${user.username}`} className="shrink-0">
                        <Avatar className="w-9 h-9 ring-1 ring-border/30 group-hover:ring-brand-medium/40 transition-all">
                          <AvatarImage src={user.avatarUrl} alt={user.username} />
                          <AvatarFallback className="bg-[#252525] text-brand-medium text-xs font-semibold uppercase">
                            {user.first_name?.[0] || user.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/profile/${user.username}`}
                            className="text-sm font-semibold text-foreground/90 hover:text-brand-medium truncate block transition-colors leading-tight"
                          >
                            {user.first_name} {user.last_name}
                          </Link>
                          {user.isVerified && (
                            <svg className="w-3.5 h-3.5 text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 truncate">@{user.username}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleFollowClick(user.id, user.username)}
                        className={cn(
                          'h-7 text-[11px] rounded-full shrink-0 font-semibold px-4 transition-all duration-200',
                          isFollowed
                            ? 'bg-[#252525] text-foreground/70 hover:bg-[#2a2a2a] border border-border/30'
                            : 'bg-brand-dark hover:bg-brand-dark/90 text-white border-0'
                        )}
                      >
                        {isFollowed ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground/40">No suggestions</div>
              )}
            </div>
            <div className="px-5 py-2.5">
              <Link href="/explore" className="text-xs font-semibold text-brand-medium/80 hover:text-brand-medium transition-colors">
                Show more →
              </Link>
            </div>
          </div>

          {/* ─── Footer ─── */}
          <div className="px-5 py-4 mt-auto">
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground/35">
              {['Terms', 'Privacy', 'Cookies', 'About'].map((item) => (
                <Link key={item} href="#" className="hover:text-muted-foreground/60 transition-colors">
                  {item}
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/25 mt-1.5">NexusPlay &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
