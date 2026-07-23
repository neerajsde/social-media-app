'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, Phone, Video, Info, ArrowLeft, Loader2, PenSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import ListSkeleton from '@/components/skeletons/ListSkeleton';
import MessageSkeleton from '@/components/skeletons/MessageSkeleton';
import SharedPostCard from '@/components/shared/SharedPostCard';
import { useGetConversationsQuery, useGetMessagesQuery, useSendMessageMutation, useMarkConversationAsReadMutation } from '@/lib/features/chat/chatApi';
import { useSearchQuery } from '@/lib/features/search/searchApi';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { toast } from 'sonner';

export default function MessagesPage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchData, isFetching: isSearching } = useSearchQuery(
    { q: searchQuery, type: 'account' },
    { skip: searchQuery.length < 2 }
  );

  const { data: conversationsData, isLoading: convsLoading } = useGetConversationsQuery(undefined, {
    pollingInterval: 10000,
  });

  const { data: messagesData, isLoading: msgsLoading } = useGetMessagesQuery(activeConv?.id || '', {
    skip: !activeConv?.id,
    pollingInterval: 5000,
  });

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkConversationAsReadMutation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = conversationsData?.data || [];
  const messages = messagesData?.data || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (!activeConv?.id) return;
    const hasUnread = messages.some((m: any) => !m.isRead && m.senderId !== currentUser?.id);
    if (hasUnread || activeConv.unreadCount > 0) {
      markAsRead(activeConv.id)
        .unwrap()
        .then(() => {
          if (activeConv.unreadCount > 0) {
            setActiveConv({ ...activeConv, unreadCount: 0 });
          }
        })
        .catch(console.error);
    }
  }, [messages, activeConv, currentUser?.id, markAsRead]);

  const participant = activeConv
    ? activeConv.participants.find((p: any) => p.id !== currentUser?.id) || activeConv.participants[0]
    : null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !participant) return;
    try {
      await sendMessage({
        receiverId: participant.id,
        content: inputText,
      }).unwrap();
      setInputText('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter((c: any) => {
    const peer = c.participants.find((p: any) => p.id !== currentUser?.id) || c.participants[0];
    if (!peer) return false;
    return (
      (peer.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (peer.first_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const searchResults = (searchData?.data as any[]) || [];
  const globalUsers = searchResults.filter(
    (user) =>
      user.id !== currentUser?.id &&
      !conversations.some((c: any) => c.participants.some((p: any) => p.id === user.id))
  );

  const startNewConversation = (user: any) => {
    const newConv = {
      id: `new-${user.id}`,
      participants: [user, currentUser],
      messages: [],
      unreadCount: 0,
    };
    setActiveConv(newConv);
    setSearchQuery('');
  };

  return (
    <div className="w-full h-[calc(100dvh-64px)] md:h-[100dvh] flex">
      {/* ─── Conversations Sidebar ─── */}
      <div
        className={cn(
          'w-full md:w-[340px] lg:w-[380px] shrink-0 flex flex-col h-full border-r border-border/60 bg-[#1a1a1a]',
          activeConv && 'hidden md:flex'
        )}
      >
        {/* Conversations Header */}
        <div className="px-5 pt-5 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold tracking-tight">Messages</h1>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <PenSquare className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-[#252525] border-transparent rounded-lg placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-brand-dark/40 focus-visible:border-brand-dark/30"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {convsLoading ? (
              <div className="px-4 py-4">
                <ListSkeleton count={8} />
              </div>
            ) : (
              <div className="px-2 pb-2 space-y-0.5">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No conversations yet</p>
                  </div>
                ) : (
                  filteredConversations.map((conv: any) => {
                    const peer = conv.participants.find((p: any) => p.id !== currentUser?.id) || conv.participants[0];
                    const isSelected = activeConv?.id === conv.id;
                    const lastMessageContent = conv.lastMessage?.content || (conv.lastMessage?.sharedPostId ? 'Shared a post' : '');
                    const peerName = peer?.first_name || peer?.last_name
                      ? `${peer.first_name || ''} ${peer.last_name || ''}`.trim()
                      : peer?.username || 'Unknown User';

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConv(conv)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150',
                          isSelected
                            ? 'bg-brand-dark/12 border border-brand-dark/15'
                            : 'hover:bg-[#252525] border border-transparent'
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="w-11 h-11 ring-1 ring-border/40">
                            <AvatarImage src={peer?.avatarUrl} alt={peer?.username || 'User'} />
                            <AvatarFallback className="bg-[#252525] text-brand-medium text-xs font-semibold uppercase">
                              {peer?.first_name?.[0] || peer?.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-brand-dark border-2 border-[#1a1a1a]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn(
                              'text-sm truncate',
                              isSelected ? 'font-semibold text-foreground' : conv.unreadCount > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                            )}>
                              {peerName}
                            </span>
                            {conv.lastMessage && (
                              <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap tabular-nums shrink-0">
                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className={cn(
                              'text-xs truncate mt-0.5',
                              conv.unreadCount > 0 ? 'text-foreground/70 font-medium' : 'text-muted-foreground/60'
                            )}>
                              {lastMessageContent}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}

                {/* Global Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">
                      People
                    </p>
                    {isSearching ? (
                      <div className="px-4 py-2">
                        <ListSkeleton count={3} />
                      </div>
                    ) : globalUsers.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground/50 py-3">No users found</p>
                    ) : (
                      globalUsers.map((user: any) => {
                        const userName = user.first_name || user.last_name
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : user.username;

                        return (
                          <button
                            key={user.id}
                            onClick={() => startNewConversation(user)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-[#252525] border border-transparent"
                          >
                            <Avatar className="w-10 h-10 ring-1 ring-border/40">
                              <AvatarImage src={user.avatarUrl} alt={user.username || 'User'} />
                              <AvatarFallback className="bg-[#252525] text-brand-medium text-xs font-semibold uppercase">
                                {user.first_name?.[0] || user.username?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{userName}</div>
                              <p className="text-xs text-muted-foreground/60 truncate">@{user.username}</p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* ─── Chat Window ─── */}
      <div className={cn('flex-1 flex flex-col h-full min-w-0 bg-[#111111]', !activeConv && 'hidden md:flex')}>
        {activeConv && participant ? (
          <>
            {/* Chat Header */}
            <div className="h-[65px] shrink-0 px-5 flex items-center justify-between border-b border-border/50 bg-[#1a1a1a]">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden w-8 h-8 shrink-0 text-muted-foreground"
                  onClick={() => setActiveConv(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9 ring-1 ring-border/40 shrink-0">
                  <AvatarImage src={participant.avatarUrl} alt={participant.username || 'User'} />
                  <AvatarFallback className="bg-[#252525] text-brand-medium text-sm font-semibold uppercase">
                    {participant.first_name?.[0] || participant.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold truncate leading-tight">
                    {participant.first_name || participant.last_name
                      ? `${participant.first_name || ''} ${participant.last_name || ''}`.trim()
                      : participant.username || 'Unknown User'}
                  </h2>
                  <p className="text-[11px] text-muted-foreground/60 truncate">@{participant.username || 'unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground/70 hover:text-foreground">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground/70 hover:text-foreground">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground/70 hover:text-foreground">
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="px-5 py-6 max-w-3xl mx-auto">
                  {msgsLoading ? (
                    <MessageSkeleton count={6} />
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-4">
                        <MessageSquare className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground/60">No messages yet</p>
                      <p className="text-xs text-muted-foreground/40 mt-1">Start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg: any) => {
                        const isSelf = msg.senderId === currentUser?.id;
                        const isPostShare = !!msg.sharedPostId;

                        return (
                          <div key={msg.id} className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}>
                            {!isSelf && !isPostShare && (
                              <Avatar className="w-7 h-7 shrink-0 mr-2 mt-1 ring-1 ring-border/30">
                                <AvatarImage src={participant.avatarUrl} />
                                <AvatarFallback className="bg-[#252525] text-brand-medium text-[10px] font-semibold uppercase">
                                  {participant.first_name?.[0] || participant.username?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={cn(
                                'max-w-[75%] lg:max-w-[60%]',
                                isPostShare && 'max-w-[85%] lg:max-w-[70%]'
                              )}
                            >
                              {isPostShare ? (
                                <SharedPostCard postId={msg.sharedPostId} />
                              ) : (
                                <div
                                  className={cn(
                                    'rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed',
                                    isSelf
                                      ? 'bg-brand-dark text-white rounded-br-md'
                                      : 'bg-[#1e1e1e] border border-border/30 text-foreground rounded-bl-md'
                                  )}
                                >
                                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                  <p
                                    className={cn(
                                      'text-[10px] mt-1.5 text-right tabular-nums',
                                      isSelf ? 'text-white/50' : 'text-muted-foreground/40'
                                    )}
                                  >
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="shrink-0 px-5 py-4 border-t border-border/40 bg-[#1a1a1a]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-3xl mx-auto">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 h-10 rounded-xl bg-[#252525] border-transparent text-sm placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-brand-dark/40 focus-visible:border-brand-dark/30"
                  disabled={isSending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isSending || !inputText.trim()}
                  className="w-10 h-10 rounded-xl bg-brand-dark hover:bg-brand-dark/90 text-white shrink-0 disabled:opacity-30 transition-opacity"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-border/30 flex items-center justify-center mb-5">
              <MessageSquare className="w-7 h-7 text-muted-foreground/25" />
            </div>
            <p className="text-base font-semibold text-foreground/70 mb-1.5">Your messages</p>
            <p className="text-sm text-muted-foreground/50 max-w-xs leading-relaxed">
              Select a conversation from the sidebar to view messages and shared posts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
