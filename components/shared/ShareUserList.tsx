'use client';

import { useState, useEffect } from 'react';
import { Search, Send, Check, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockUsers } from '@/lib/mock-data';
import { useLazySearchQuery } from '@/lib/features/search/searchApi';
import type { User } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ShareUserListProps {
  postId: string;
  onShare: (user: User) => Promise<void>;
}

export default function ShareUserList({ postId, onShare }: ShareUserListProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [sendingState, setSendingState] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});
  
  const [triggerSearch, { data: searchResponse, isFetching }] = useLazySearchQuery();

  useEffect(() => {
    if (query.trim() === '') {
      setUsers(mockUsers);
      return;
    }

    const timer = setTimeout(() => {
      triggerSearch({ q: query, type: 'account' });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, triggerSearch]);

  useEffect(() => {
    if (searchResponse?.success && Array.isArray(searchResponse.data)) {
      // Map SearchUserResult to User
      const results = searchResponse.data as any[];
      const mapped = results.map(u => ({
        id: u.id,
        username: u.username,
        first_name: u.first_name,
        last_name: u.last_name,
        avatarUrl: u.avatarUrl,
        isVerified: u.isVerified,
      }));
      setUsers(mapped);
    }
  }, [searchResponse]);

  const handleSend = async (user: User) => {
    setSendingState(prev => ({ ...prev, [user.id]: 'sending' }));
    try {
      await onShare(user);
      setSendingState(prev => ({ ...prev, [user.id]: 'sent' }));
    } catch {
      setSendingState(prev => ({ ...prev, [user.id]: 'idle' }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-10 bg-accent/30 border-border/80 text-sm focus-visible:ring-brand-medium rounded-xl"
        />
        {isFetching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* User list */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {users.length > 0 ? (
          users.map((u) => {
            const state = sendingState[u.id] || 'idle';
            const fullName = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username;
            
            return (
              <div key={u.id} className="flex items-center justify-between p-2 hover:bg-accent/40 rounded-xl transition-colors gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-9 h-9 border border-border/60">
                    <AvatarImage src={u.avatarUrl} alt={u.username} />
                    <AvatarFallback className="bg-brand-medium/20 text-brand-dark font-bold text-xs">
                      {u.first_name?.[0] || u.username?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-foreground truncate">{fullName}</span>
                      {u.isVerified && (
                        <svg className="w-3.5 h-3.5 text-brand-dark dark:text-brand-medium shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">@{u.username}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  disabled={state !== 'idle'}
                  onClick={() => handleSend(u)}
                  className={cn(
                    'h-8 px-4 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 min-w-[70px]',
                    state === 'sent' && 'bg-green-500 hover:bg-green-600 text-white border-none',
                    state === 'sending' && 'bg-accent text-muted-foreground'
                  )}
                >
                  {state === 'sending' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : state === 'sent' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
