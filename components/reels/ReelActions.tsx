'use client';

import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ReelActionsProps {
  liked: boolean;
  likeCount: number;
  commentCount: number;
  bookmarked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onReport?: () => void;
}

export default function ReelActions({
  liked,
  likeCount,
  commentCount,
  bookmarked,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onReport
}: ReelActionsProps) {
  const formatCount = (count: number) => {
    if (count < 1000) return count;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  return (
    <div className="absolute bottom-6 right-2 flex flex-col items-center gap-5 z-20 pointer-events-auto">
      
      {/* Like */}
      <button onClick={onLike} className="flex flex-col items-center gap-1 group">
        <div className="bg-black/20 p-2.5 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-colors">
          <Heart 
            className={cn("w-7 h-7 transition-all duration-300", liked ? "fill-[#e11d48] text-[#e11d48] scale-110" : "text-white")} 
          />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">{formatCount(likeCount)}</span>
      </button>

      {/* Comment */}
      <button onClick={onComment} className="flex flex-col items-center gap-1 group">
        <div className="bg-black/20 p-2.5 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-colors">
          <MessageCircle className="w-7 h-7 text-white" />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">{formatCount(commentCount)}</span>
      </button>

      {/* Share */}
      <button onClick={onShare} className="flex flex-col items-center gap-1 group">
        <div className="bg-black/20 p-2.5 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-colors">
          <Send className="w-7 h-7 text-white -ml-0.5" />
        </div>
        <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
      </button>

      {/* Bookmark */}
      <button onClick={onBookmark} className="flex flex-col items-center gap-1 group">
        <div className="bg-black/20 p-2.5 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-colors">
          <Bookmark 
            className={cn("w-7 h-7 transition-all duration-300", bookmarked ? "fill-white text-white" : "text-white")} 
          />
        </div>
      </button>

      {/* More */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-col items-center gap-1 group outline-none mt-2">
            <div className="bg-black/20 p-2 rounded-full backdrop-blur-md group-hover:bg-black/40 transition-colors">
              <MoreVertical className="w-5 h-5 text-white" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-[#111111] border-white/10 text-white w-40">
          <DropdownMenuItem onClick={onReport} className="text-red-500 focus:text-red-500 focus:bg-white/5 cursor-pointer">
            Report
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">
            Not Interested
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  );
}
