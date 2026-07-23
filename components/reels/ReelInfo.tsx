'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Music } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Post } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ReelInfoProps {
  post: Post;
  onFollow?: () => void;
  isFollowing?: boolean;
}

export default function ReelInfo({ post, onFollow, isFollowing }: ReelInfoProps) {
  const [expanded, setExpanded] = useState(false);

  const truncatedCaption = post.content 
    ? post.content.length > 60 && !expanded 
      ? post.content.substring(0, 60) + '...'
      : post.content
    : '';

  return (
    <div className="absolute bottom-0 left-0 right-16 p-4 z-20 pointer-events-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
      <div className="flex flex-col gap-3">
        
        {/* User Info */}
        <div className="flex items-center gap-2">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar className="w-10 h-10 border border-white/20 hover:border-white/50 transition-colors">
              <AvatarImage src={post.user.avatarUrl || ''} />
              <AvatarFallback className="bg-[#222222] text-white">
                {post.user.first_name?.[0] || post.user.username[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/profile/${post.user.id}`} className="text-white font-semibold text-[15px] hover:underline shadow-sm">
              {post.user.username}
            </Link>
            
            {!isFollowing && (
              <>
                <span className="w-1 h-1 bg-white/50 rounded-full" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-white font-semibold hover:bg-white/10 hover:text-white"
                  onClick={onFollow}
                >
                  Follow
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Caption */}
        {post.content && (
          <div className="text-sm text-white/95 leading-relaxed drop-shadow-md cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({node, ...props}) => <a className="text-[#00D084] hover:underline font-medium" {...props} />,
                p: ({node, ...props}) => <p className="inline" {...props} />
              }}
            >
              {truncatedCaption}
            </ReactMarkdown>
            {post.content.length > 60 && !expanded && (
              <span className="text-white/60 font-medium ml-1">more</span>
            )}
          </div>
        )}

        {/* Hashtags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 5).map((tag) => (
              <Link key={tag} href={`/search?q=${tag}`} className="text-sm text-white font-bold drop-shadow-md hover:underline">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Audio Info */}
        <div className="flex items-center gap-2 mt-1 w-full overflow-hidden">
          <Music className="w-4 h-4 text-white shrink-0 shadow-sm" />
          <div className="relative overflow-hidden w-[200px] flex group">
            <div className="whitespace-nowrap text-sm text-white font-medium drop-shadow-md flex animate-[marquee_5s_linear_infinite] group-hover:[animation-play-state:paused]">
              <span className="mr-8">{post.reel?.musicName || "Original audio"}</span>
              <span className="mr-8">{post.reel?.musicName || "Original audio"}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
