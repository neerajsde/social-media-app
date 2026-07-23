'use client';

import { useState } from 'react';
import { Copy, Share2, Link as LinkIcon, Sparkles, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
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
          text: 'Check out this premium post on ReelTube!',
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

      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex-1 min-w-[120px] h-10 rounded-xl text-xs font-bold border-border/80 hover:bg-accent/40"
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
          className="flex-1 min-w-[120px] h-10 rounded-xl text-xs font-bold border-border/80 hover:bg-accent/40 text-brand-medium"
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

  const isDesktop = useMediaQuery('(min-width: 640px)');

  if (isDesktop) {
    return (
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
    );
  }

  return (
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
  );
}
