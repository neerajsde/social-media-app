'use client';

import { useState, useEffect } from 'react';
import { Send, Search, MessageSquare, Phone, Video, Info, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import SharedPostCard from '@/components/shared/SharedPostCard';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Record<string, any[]>>({});

  // Sync messages and conversations from localStorage or load default mock data
  useEffect(() => {
    const defaultMessages = {
      'c1': [
        { id: 'm1_1', senderId: '3', content: 'Hey Sarah! Loved your golden hour shot!', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
        { id: 'm1_2', senderId: '1', content: 'Thank you so much! Really appreciate it.', createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
        { id: 'm1_3', senderId: '3', content: 'Hey! Love your latest project. Can we collab?', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      ],
      'c2': [
        { id: 'm2_1', senderId: '1', content: 'Did you edit the Kyoto photos yet?', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
        { id: 'm2_2', senderId: '2', content: 'The photos from the trip turned out amazing!', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      ],
      'c3': [
        { id: 'm3_1', senderId: '5', content: 'Sent you the design files', createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
      ],
    };

    const storedMessages = localStorage.getItem('sarah_creates_messages');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch {
        setMessages(defaultMessages);
      }
    } else {
      localStorage.setItem('sarah_creates_messages', JSON.stringify(defaultMessages));
      setMessages(defaultMessages);
    }

    const storedConversations = localStorage.getItem('sarah_creates_conversations');
    if (storedConversations) {
      try {
        const parsed = JSON.parse(storedConversations);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConv(parsed[0]);
        }
      } catch {
        setConversations(mockConversations);
        setActiveConv(mockConversations[0]);
      }
    } else {
      localStorage.setItem('sarah_creates_conversations', JSON.stringify(mockConversations));
      setConversations(mockConversations);
      setActiveConv(mockConversations[0]);
    }
  }, []);

  const participant = activeConv
    ? activeConv.participants.find((p: any) => p.username !== 'sarah_creates') || activeConv.participants[0]
    : null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const newMsg = {
      id: `m_${Math.random().toString()}`,
      senderId: '1', // Current user
      content: inputText,
      createdAt: new Date().toISOString(),
    };

    const updatedMsgs = {
      ...messages,
      [activeConv.id]: [...(messages[activeConv.id] || []), newMsg],
    };
    setMessages(updatedMsgs);
    localStorage.setItem('sarah_creates_messages', JSON.stringify(updatedMsgs));

    const updatedConvs = conversations.map((c) =>
      c.id === activeConv.id
        ? {
            ...c,
            lastMessage: {
              id: newMsg.id,
              content: newMsg.content.startsWith('[POST_SHARE:') ? 'Shared a post' : newMsg.content,
              senderId: newMsg.senderId,
              createdAt: newMsg.createdAt,
              isRead: true,
            },
            updatedAt: newMsg.createdAt,
          }
        : c
    );
    setConversations(updatedConvs);
    localStorage.setItem('sarah_creates_conversations', JSON.stringify(updatedConvs));

    setInputText('');
  };

  const filteredConversations = conversations.filter((c) => {
    const peer = c.participants.find((p: any) => p.username !== 'sarah_creates') || c.participants[0];
    return (
      peer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (peer.first_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-64px)] md:h-screen flex flex-col md:flex-row border-r border-border bg-card/10">
      {/* Conversations List Panel */}
      <div className={cn('w-full md:w-[320px] flex flex-col border-r border-border bg-background', activeConv && 'hidden md:flex')}>
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

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const peer = conv.participants.find((p: any) => p.username !== 'sarah_creates') || conv.participants[0];
              const isSelected = activeConv?.id === conv.id;
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
                    <AvatarImage src={peer.avatarUrl} alt={peer.username} />
                    <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-xs">{peer.first_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">{peer.first_name} {peer.last_name}</span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage.content}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-dark dark:bg-brand-medium shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Message Window Panel */}
      <div className={cn('flex-1 flex flex-col bg-background/50', !activeConv && 'hidden md:flex')}>
        {activeConv && participant ? (
          <>
            {/* Window Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden w-8 h-8 mr-1" onClick={() => setActiveConv(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Avatar className="w-9 h-9 border border-border">
                  <AvatarImage src={participant.avatarUrl} alt={participant.username} />
                  <AvatarFallback className="bg-brand-medium/20 text-brand-dark text-sm">{participant.first_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-semibold leading-none">{participant.first_name} {participant.last_name}</h2>
                  <p className="text-xs text-muted-foreground mt-1">@{participant.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Info className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages[activeConv.id] || []).map((msg) => {
                  const isSelf = msg.senderId === '1';
                  const postShareRegex = /^\[POST_SHARE:(.+)\]$/;
                  const shareMatch = msg.content.match(postShareRegex);
                  const isPostShare = !!shareMatch;
                  const sharedPostId = shareMatch ? shareMatch[1] : null;

                  return (
                    <div key={msg.id} className={cn('flex', isSelf ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed',
                        isSelf
                          ? 'bg-brand-dark text-brand-lightest rounded-tr-none'
                          : 'bg-card border border-border text-foreground rounded-tl-none',
                        isPostShare && 'p-0.5 border-none bg-transparent shadow-none'
                      )}>
                        {isPostShare && sharedPostId ? (
                          <SharedPostCard postId={sharedPostId} />
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
              </div>
            </ScrollArea>

            {/* Input Footer */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="rounded-full bg-accent/40 border-border focus-visible:ring-brand-medium"
                />
                <Button type="submit" size="icon" className="bg-brand-dark hover:bg-brand-dark/90 text-brand-lightest rounded-full shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground font-semibold">Select a conversation</p>
            <p className="text-sm text-muted-foreground max-w-xs">Pick one from the list or start a new conversation with a peer to communicate directly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
