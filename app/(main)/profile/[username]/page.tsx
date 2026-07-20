'use client';

import { use } from 'react';
import Link from 'next/link';
import { MapPin, LinkIcon, CalendarDays, ArrowLeft, Grid3x3, Bookmark, Film } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import PostCard from '@/components/shared/PostCard';
import { mockUsers, mockPosts, formatCount } from '@/lib/mock-data';
import { useState } from 'react';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [tab, setTab] = useState('posts');
  const user = mockUsers.find((u) => u.username === username) || mockUsers[0];
  const userPosts = mockPosts.filter((p) => p.author.username === user.username);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-sm font-bold">{user.first_name} {user.last_name}</h1>
          <p className="text-xs text-muted-foreground">{formatCount(user.postCount || 0)} posts</p>
        </div>
      </div>

      {/* Banner */}
      <div className="relative">
        <div className="h-32 sm:h-44 bg-gradient-to-r from-brand-dark to-brand-medium overflow-hidden">
          {user.bannerUrl && <img src={user.bannerUrl} alt="Banner" className="w-full h-full object-cover" />}
        </div>
        <div className="absolute -bottom-12 left-4">
          <Avatar className="w-24 h-24 ring-4 ring-background">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-brand-medium text-brand-lightest text-xl">{user.first_name?.[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pt-14 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-1.5">
              {user.first_name} {user.last_name}
              {user.isVerified && <svg className="w-5 h-5 text-brand-dark dark:text-brand-medium" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>}
            </h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-brand-dark/20 text-brand-dark hover:bg-brand-dark hover:text-brand-lightest dark:border-brand-medium/30 dark:text-brand-medium dark:hover:bg-brand-medium dark:hover:text-brand-darkest">
            Follow
          </Button>
        </div>

        {user.bio && <p className="text-sm mb-3 leading-relaxed">{user.bio}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />San Francisco, CA</span>
          <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /><a href="#" className="text-brand-dark dark:text-brand-medium hover:underline">portfolio.dev</a></span>
          <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />Joined June 2024</span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link href="#" className="hover:underline"><span className="font-semibold">{formatCount(user.followingCount || 0)}</span> <span className="text-muted-foreground">Following</span></Link>
          <Link href="#" className="hover:underline"><span className="font-semibold">{formatCount(user.followersCount || 0)}</span> <span className="text-muted-foreground">Followers</span></Link>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full bg-transparent justify-start rounded-none border-b-0 p-0 h-auto gap-0">
          {[
            { value: 'posts', icon: Grid3x3, label: 'Posts' },
            { value: 'media', icon: Film, label: 'Media' },
            { value: 'saved', icon: Bookmark, label: 'Saved' },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-brand-dark dark:data-[state=active]:border-brand-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 text-sm font-medium">
              <Icon className="w-4 h-4 mr-1.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Content */}
      <div className="p-4 space-y-4">
        {tab === 'posts' && (
          userPosts.length > 0 ? userPosts.map((post) => <PostCard key={post.id} post={post} />) : (
            <div className="text-center py-16 space-y-2">
              <Grid3x3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm text-muted-foreground">When this user creates posts, they will appear here.</p>
            </div>
          )
        )}
        {tab === 'media' && (
          <div className="grid grid-cols-3 gap-1">
            {mockPosts.filter((p) => p.images?.length).map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="aspect-square overflow-hidden rounded-md bg-muted">
                <img src={post.images![0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
              </Link>
            ))}
          </div>
        )}
        {tab === 'saved' && (
          <div className="text-center py-16 space-y-2">
            <Bookmark className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <p className="text-lg font-medium">Nothing saved</p>
            <p className="text-sm text-muted-foreground">Save posts to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
