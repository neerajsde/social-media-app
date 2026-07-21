'use client';

import { useState } from 'react';
import { Copy, Share2, Link as LinkIcon, Sparkles, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ShareUserList from './ShareUserList';
import { useSharePostInAppMutation, useSharePostExternallyMutation } from '@/lib/features/post/postApi';
import { toast } from 'sonner';
import type { User } from '@/lib/types';

interface SharePostDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SharePostDialog({ postId, open, onOpenChange }: SharePostDialogProps) {
  const [shareInApp] = useSharePostInAppMutation();
  const [shareExternally] = useSharePostExternallyMutation();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    const link = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          text: 'Check out this premium post on NexusPlay!',
          url: link,
        });
        await shareExternally(postId).unwrap();
        toast.success('Shared successfully');
      } catch (err) {
        // Ignored, user cancelled
      }
    } else {
      // Fallback
      handleCopyLink();
    }
  };

  const handleShareToStory = () => {
    toast.success('Shared to Story! (Simulated)');
  };

  const handleShareInApp = async (user: User) => {
    try {
      // 1. Trigger API sharing endpoint
      await shareInApp({ postId, receiverId: user.id }).unwrap();

      // 2. Write to local storage conversations so the shared post appears in the Chat page
      const storageKey = 'sarah_creates_messages'; // Assuming logged-in user in mock data
      const localMessagesRaw = localStorage.getItem(storageKey);
      let localMessages: Record<string, any[]> = {};
      
      if (localMessagesRaw) {
        try {
          localMessages = JSON.parse(localMessagesRaw);
        } catch {
          localMessages = {};
        }
      }

      // Find if conversation exists between sarah_creates (ID: '1') and this user.
      // In messages/page.tsx, mockConversations use 'c1' for maya_codes (ID: '3'), 'c2' for alex_wanderer (ID: '2'), 'c3' for emma_designs (ID: '5')
      let convId = '';
      if (user.id === '3' || user.username === 'maya_codes') convId = 'c1';
      else if (user.id === '2' || user.username === 'alex_wanderer') convId = 'c2';
      else if (user.id === '5' || user.username === 'emma_designs') convId = 'c3';
      else {
        // Dynamic new conversation ID
        convId = `c_${user.id}`;
      }

      const postShareMessage = {
        id: `share_${Math.random().toString()}`,
        senderId: '1', // current user ID
        content: `[POST_SHARE:${postId}]`,
        createdAt: new Date().toISOString(),
        isRead: false,
      };

      if (!localMessages[convId]) {
        localMessages[convId] = [];
      }
      localMessages[convId].push(postShareMessage);

      // Save messages back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(localMessages));

      // 3. Update the conversation list lastMessage
      const convListKey = 'sarah_creates_conversations';
      const localConvsRaw = localStorage.getItem(convListKey);
      if (localConvsRaw) {
        try {
          const localConvs = JSON.parse(localConvsRaw);
          const updatedConvs = localConvs.map((c: any) => {
            if (c.id === convId) {
              return {
                ...c,
                lastMessage: {
                  id: postShareMessage.id,
                  content: 'Shared a post',
                  senderId: '1',
                  createdAt: postShareMessage.createdAt,
                  isRead: true,
                },
                updatedAt: postShareMessage.createdAt,
              };
            }
            return c;
          });
          localStorage.setItem(convListKey, JSON.stringify(updatedConvs));
        } catch {
          // ignore
        }
      }

      toast.success(`Post shared with @${user.username} successfully`);
    } catch (err: any) {
      const message = err?.data?.message || 'Failed to share post in chat';
      toast.error(message);
      throw err;
    }
  };

  const shareContent = (
    <div className="space-y-4 py-3">
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Suggested Users
        </h3>
        <ShareUserList postId={postId} onShare={handleShareInApp} />
      </div>

      <div className="h-[1px] bg-border/40" />

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex-1 h-10 rounded-xl text-xs font-bold border-border/80 hover:bg-accent/40"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1.5" />
              Copy Link
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={handleShareToStory}
          className="flex-1 h-10 rounded-xl text-xs font-bold border-border/80 hover:bg-accent/40 text-brand-medium"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Share to Story
        </Button>
        <Button
          variant="outline"
          onClick={handleNativeShare}
          className="h-10 w-10 p-0 rounded-xl border-border/80 hover:bg-accent/40 shrink-0"
          title="More Share Options"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop view (dialog) */}
      <div className="hidden sm:block">
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md bg-card/95 border-border/80 backdrop-blur-xl rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Share Post</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send this post to friends in chat or share externally.
              </DialogDescription>
            </DialogHeader>
            {shareContent}
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile view (bottom drawer sheet) */}
      <div className="block sm:hidden">
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="rounded-t-2xl bg-card border-t border-border/80 px-4 pb-6">
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg font-bold">Share Post</SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Send this post to friends in chat or share externally.
              </SheetDescription>
            </SheetHeader>
            {shareContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
