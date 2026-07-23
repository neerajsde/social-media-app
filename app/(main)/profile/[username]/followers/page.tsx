'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetUserProfileByUsernameQuery, useGetFollowersQuery } from '@/lib/features/user/userApi';
import UserListCard from '@/components/shared/UserListCard';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FollowersPage() {
  const { username } = useParams() as { username: string };
  const router = useRouter();
  const [page, setPage] = useState(1);

  // 1. Fetch user profile to get the userId
  const { data: profileResponse, isLoading: profileLoading } = useGetUserProfileByUsernameQuery(username);
  const userId = profileResponse?.user?.id;

  // 2. Fetch followers using the userId
  const { data: followersResponse, isLoading: followersLoading, isFetching } = useGetFollowersQuery(
    { userId: userId || '', page, limit: 30 },
    { skip: !userId }
  );

  const followers = followersResponse?.data?.items || [];
  const total = followersResponse?.data?.total || 0;
  const hasMore = followers.length < total;

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage(p => p + 1);
    }
  };

  const isLoading = profileLoading || (followersLoading && page === 1);

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 flex flex-col bg-background/95 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight">Followers</h1>
            <span className="text-xs text-muted-foreground">@{username}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4 flex flex-col gap-1">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-medium" />
          </div>
        ) : followers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-medium text-foreground">No followers yet</p>
            <p className="text-sm mt-1">This user doesn't have any followers.</p>
          </div>
        ) : (
          <>
            {followers.map((user: any) => (
              <UserListCard key={user.id} user={user} />
            ))}
            
            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore} 
                  disabled={isFetching}
                  className="rounded-full border-white/10 hover:bg-white/5"
                >
                  {isFetching ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
