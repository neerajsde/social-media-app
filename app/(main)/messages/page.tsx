'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Search, MessageSquare, Phone, Video, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
    pollingInterval: 10000, // Poll every 10s for new messages/conversations
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
    
    // Check if there are unread messages from the other participant
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
    <div className="w-full max-w-4xl h-[calc(100vh-64px)] md:h-screen flex flex-col md:flex-row border-r border-border bg-card/10">
      {/* Conversations List Panel */}
      <div className={cn('w-full md:w-[320px] flex flex-col overflow-hidden border-r border-border bg-background', activeConv && 'hidden md:flex')}>
        <div className="p-4 border-b border-border space-y-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
            Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {convsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No conversations yet.
                  </div>
                ) : (
                  filteredConversations.map((conv: any) => {
                    const peer = conv.participants.find((p: any) => p.id !== currentUser?.id) || conv.participants[0];
                    const isSelected = activeConv?.id === conv.id;
                    const lastMessageContent = conv.lastMessage?.content || (conv.lastMessage?.sharedPostId ? 'Shared a post' : '');

                    return (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConv(conv)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                          isSelected
                            ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest'
                            : 'hover:bg-accent/60'
                        )}
                      >
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarImage src={peer?.avatarUrl} alt={peer?.username || 'User'} />
                          <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs uppercase">
                            {peer?.first_name?.[0] || peer?.username?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm truncate">
                              {peer?.first_name || peer?.last_name 
                                ? `${peer.first_name || ''} ${peer.last_name || ''}`.trim() 
                                : peer?.username || 'Unknown User'}
                            </span>
                            {conv.lastMessage && (
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMessageContent}</p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-dark dark:bg-brand-medium shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}

                {/* Global Search Results */}
                {searchQuery.length >= 2 && (
                  <div className="mt-4 border-t border-border pt-4">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                      Global Search
                    </h3>
                    {isSearching ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : globalUsers.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground py-2">No other users found.</p>
                    ) : (
                      globalUsers.map((user: any) => {
                        const userName = user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                          : user.username;
                          
                        return (
                          <button
                            key={user.id}
                            onClick={() => startNewConversation(user)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-accent/60"
                          >
                            <Avatar className="w-10 h-10 border border-border">
                              <AvatarImage src={user.avatarUrl} alt={user.username || 'User'} />
                              <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs uppercase">
                                {user.first_name?.[0] || user.username?.[0] || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm truncate">{userName}</div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">@{user.username}</p>
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

      {/* Message Window Panel */}
      <div className={cn('flex-1 flex flex-col overflow-hidden bg-background/50', !activeConv && 'hidden md:flex')}>
        {activeConv && participant ? (
          <>
            {/* Window Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden w-8 h-8 mr-1" onClick={() => setActiveConv(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9 border border-border">
                  <AvatarImage src={participant.avatarUrl} alt={participant.username || 'User'} />
                  <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-sm uppercase">
                    {participant.first_name?.[0] || participant.username?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold leading-none">
                    {participant.first_name || participant.last_name 
                      ? `${participant.first_name || ''} ${participant.last_name || ''}`.trim() 
                      : participant.username || 'Unknown User'}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">@{participant.username || 'unknown'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Info className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {msgsLoading ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg: any) => {
                        const isSelf = msg.senderId === currentUser?.id;
                        const isPostShare = !!msg.sharedPostId;

                        return (
                          <div key={msg.id} className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}>
                            <div className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed',
                              isSelf
                                ? 'bg-brand-dark text-brand-lightest rounded-tr-none'
                                : 'bg-card border border-border text-foreground rounded-tl-none',
                              isPostShare && 'p-0.5 border-none bg-transparent shadow-none'
                            )}>
                              {isPostShare ? (
                                <SharedPostCard postId={msg.sharedPostId} />
                              ) : (
                                <>
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                  <p className={cn('text-[9px] mt-1 text-right', isSelf ? 'text-brand-lightest/70' : 'text-muted-foreground')}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </>
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

            {/* Input Footer */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="rounded-full bg-accent/40 border-border focus-visible:ring-brand-medium"
                  disabled={isSending}
                />
                <Button type="submit" size="icon" disabled={isSending} className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest rounded-full shrink-0">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground font-semibold">Select a conversation</p>
            <p className="text-sm text-muted-foreground max-w-xs">Pick one from the list to see messages and shared posts.</p>
          </div>
        )}
      </div>
    </div>
  );
}
