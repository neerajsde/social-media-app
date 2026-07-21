'use client';

import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReplyButtonProps {
  onClick: () => void;
  replyCount?: number;
}

export default function ReplyButton({ onClick, replyCount = 0 }: ReplyButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-7 px-2 gap-1 text-[11px] text-muted-foreground hover:bg-transparent hover:text-foreground font-semibold"
      aria-label="Reply to comment"
    >
      <MessageSquare className="w-3.5 h-3.5" />
      <span>{replyCount > 0 ? `${replyCount} replies` : 'Reply'}</span>
    </Button>
  );
}
