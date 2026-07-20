'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, MessageCircle, Bookmark, User, Settings, PlusSquare, TrendingUp, LogOut, Compass } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/notifications', icon: Bell, label: 'Notifications', auth: true },
  { href: '/messages', icon: MessageCircle, label: 'Messages', auth: true },
  { href: '/saved', icon: Bookmark, label: 'Saved', auth: true },
];

const secondaryItems = [
  { href: '/settings', icon: Settings, label: 'Settings', auth: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="sticky top-0 h-screen w-[68px] xl:w-[240px] border-r border-border flex flex-col bg-background z-30 shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 xl:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand-lightest" />
            </div>
            <span className="hidden xl:block text-lg font-bold text-foreground tracking-tight">NexusPlay</span>
          </Link>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2 xl:px-3 py-4">
          {navItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
            if (requiresAuth && !isAuthenticated) return null;
            const isActive = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-brand-dark dark:text-brand-medium')} />
                    <span className="hidden xl:block">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {isAuthenticated && (
            <>
              <Separator className="my-2" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/create"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-brand-dark text-brand-lightest hover:bg-brand-dark/90 transition-colors"
                  >
                    <PlusSquare className="w-5 h-5 shrink-0" />
                    <span className="hidden xl:block">Create Post</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">
                  Create Post
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="px-2 xl:px-3 pb-4 space-y-1">
          {secondaryItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
            if (requiresAuth && !isAuthenticated) return null;
            const isActive = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="hidden xl:block">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          <Separator className="my-2" />

          {isAuthenticated && user ? (
            <Link href={`/profile/${user.username}`} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback className="bg-brand-medium text-brand-lightest text-xs">{user.first_name?.[0] || user.username[0]}</AvatarFallback>
              </Avatar>
              <div className="hidden xl:block min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
              </div>
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full justify-center xl:justify-start">
                  <LogOut className="w-4 h-4 xl:mr-2" />
                  <span className="hidden xl:inline">Log In</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
