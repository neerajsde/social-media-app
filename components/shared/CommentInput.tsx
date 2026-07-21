'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, AtSign, Loader2, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector } from '@/lib/hooks';
import { mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import LoginRequiredDialog from './LoginRequiredDialog';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  submitLabel?: string;
  replyToUser?: string;
}

const CHARACTER_LIMIT = 500;

export default function CommentInput({
  onSubmit,
  placeholder = 'Add a comment...',
  autoFocus = false,
  submitLabel = 'Send',
  replyToUser,
}: CommentInputProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (replyToUser) {
      setContent(`@${replyToUser} `);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [replyToUser]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside to close mentions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > CHARACTER_LIMIT) return;
    setContent(value);

    // Detect mention trigger '@'
    const words = value.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const search = lastWord.slice(1);
      setMentionSearch(search);
      setShowMentions(true);

      const matching = mockUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(search.toLowerCase()) ||
          `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(matching);
    } else {
      setShowMentions(false);
      setMentionSearch(null);
    }
  };

  const insertMention = (username: string) => {
    const words = content.split(/\s/);
    words[words.length - 1] = `@${username} `;
    const newContent = words.join(' ');
    if (newContent.length <= CHARACTER_LIMIT) {
      setContent(newContent);
    }
    setShowMentions(false);
    setMentionSearch(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleTriggerMention = () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }
    setContent((prev) => prev + '@');
    setShowMentions(true);
    setFilteredUsers(mockUsers);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const characterCount = content.length;
  const isButtonDisabled = !content.trim() || isLoading;

  return (
    <>
      <div ref={containerRef} className="relative w-full bg-card/60 border border-border/50 rounded-2xl p-2.5 shadow-inner">
        {/* Mentions Dropdown list */}
        {showMentions && filteredUsers.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border/80 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-border/40 animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-accent/20">
              Mention user
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-thin">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => insertMention(u.username)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent/60 transition-colors"
                >
                  <Avatar className="w-7 h-7 border border-border/50">
                    <AvatarImage src={u.avatarUrl} alt={u.username} />
                    <AvatarFallback className="bg-brand-medium/20 text-brand-dark font-bold text-[10px]">
                      {u.first_name?.[0] || u.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username}
                    </span>
                    <span className="text-[10px] text-muted-foreground">@{u.username}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex gap-2.5 items-end">
          <Avatar className="w-8 h-8 ring-1 ring-border/50 shrink-0 mb-0.5">
            <AvatarImage src={user?.avatarUrl} alt={user?.username || 'Guest'} />
            <AvatarFallback className="bg-brand-medium/10 text-xs font-bold text-brand-dark">
              {user?.first_name?.[0] || user?.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <Textarea
              ref={textareaRef}
              rows={1}
              value={content}
              onChange={handleInputChange}
              placeholder={isAuthenticated ? placeholder : 'Log in to participate in the discussion...'}
              disabled={!isAuthenticated}
              className="min-h-[38px] max-h-[120px] resize-none py-2 px-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm shadow-none leading-relaxed placeholder:text-muted-foreground/60 w-full"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 mb-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleTriggerMention}
              className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/40"
              title="Mention a user"
            >
              <AtSign className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              size="icon"
              disabled={isButtonDisabled}
              className="w-8 h-8 rounded-full bg-brand-dark hover:bg-brand-dark/95 text-brand-lightest transition-all shrink-0 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>

        {/* Character Limit Countdown */}
        {characterCount > CHARACTER_LIMIT - 50 && (
          <div className="absolute right-3.5 bottom-1 text-[10px] text-red-500 font-semibold tabular-nums">
            {CHARACTER_LIMIT - characterCount} characters remaining
          </div>
        )}
      </div>

      <LoginRequiredDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
}
