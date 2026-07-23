'use client';

import React from 'react';
import { useGetSuggestedUsersQuery } from '@/lib/features/user/userApi';
import UserListCard from '@/components/shared/UserListCard';
import { Loader2, Users } from 'lucide-react';

export default function SuggestedUsersPage() {
  // Pass a larger limit to get a good list of users
  const { data, isLoading, error } = useGetSuggestedUsersQuery({ limit: 50 });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Users className="w-8 h-8 text-brand-dark" />
          Who to Follow
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover and connect with people who share your interests.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-dark" />
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-500/10 rounded-2xl border border-red-500/20">
          <p className="text-red-500 font-medium">Failed to load suggested users.</p>
        </div>
      ) : data?.users && data.users.length > 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-2 sm:p-4 shadow-xl backdrop-blur-sm">
          <div className="grid gap-2">
            {data.users.map((user) => (
              <UserListCard key={user.id} user={user} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">No recommendations yet</p>
          <p className="text-muted-foreground mt-1">Check back later for more people to follow.</p>
        </div>
      )}
    </div>
  );
}
