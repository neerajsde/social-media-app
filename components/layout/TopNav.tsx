'use client';

import { usePathname } from 'next/navigation';
import { Home, Compass, Search, Bell, MessageCircle, Bookmark, Settings, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/lib/hooks';
import { toggleSidebar } from '@/lib/features/ui/uiSlice';
import { Button } from '@/components/ui/button';

export default function TopNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  
  let title = 'Home';
  let Icon = Home;

  if (pathname.startsWith('/explore')) {
    title = 'Explore';
    Icon = Compass;
  } else if (pathname.startsWith('/search')) {
    title = 'Search';
    Icon = Search;
  } else if (pathname.startsWith('/notifications')) {
    title = 'Notifications';
    Icon = Bell;
  } else if (pathname.startsWith('/messages')) {
    title = 'Messages';
    Icon = MessageCircle;
  } else if (pathname.startsWith('/saved')) {
    title = 'Saved';
    Icon = Bookmark;
  } else if (pathname.startsWith('/settings')) {
    title = 'Settings';
    Icon = Settings;
  } else if (pathname.startsWith('/profile')) {
    title = 'Profile';
    Icon = User;
  }

  return (
    <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 h-14 flex items-center gap-3 shrink-0">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => dispatch(toggleSidebar())}
        className="hidden xl:flex w-9 h-9 text-muted-foreground hover:text-foreground shrink-0"
      >
        <Menu className="w-5 h-5" />
      </Button>
      <Icon className="w-5 h-5 text-brand-dark dark:text-brand-medium" />
      <h1 className="text-lg font-bold">{title}</h1>
    </div>
  );
}
