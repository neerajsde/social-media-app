'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Search, Bell, MessageCircle, Bookmark, User,
  Settings, PlusSquare, TrendingUp, LogOut, Compass, MoreHorizontal,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/features/auth/authSlice';
import { toast } from 'sonner';

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
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <TooltipProvider delay={0}>
      <aside className="sticky top-0 h-screen w-[68px] xl:w-[248px] border-r border-border/40 flex flex-col bg-background/98 backdrop-blur-xl z-30 shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-3 xl:px-5 border-b border-border/40">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-dark to-brand-medium flex items-center justify-center shadow-lg shadow-brand-dark/30 group-hover:shadow-brand-dark/50 transition-shadow shrink-0">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="hidden xl:block text-lg font-bold text-foreground tracking-tight">NexusPlay</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 xl:px-3 py-4 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
            if (requiresAuth && !isAuthenticated) return null;
            const isActive = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={
                  <Link
                    href={href}
                    className={cn(
                      'group relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-brand-dark/10 dark:bg-brand-medium/12 text-brand-dark dark:text-brand-medium ring-1 ring-brand-dark/10 dark:ring-brand-medium/10'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  />
                }>
                  {/* Active left accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-brand-dark dark:bg-brand-medium rounded-r-full" />
                  )}
                  <Icon className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-brand-dark dark:text-brand-medium' : ''
                  )} />
                  <span className="hidden xl:block truncate">{label}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden font-medium">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {isAuthenticated && (
            <>
              <div className="my-2 h-px bg-border/40 mx-1" />
              <Tooltip>
                <TooltipTrigger render={
                  <Link
                    href="/create"
                    className="group flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-brand-dark to-brand-medium text-white hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md shadow-brand-dark/20"
                  />
                }>
                  <PlusSquare className="w-5 h-5 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden xl:block">Create Post</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden font-medium">
                  Create Post
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="px-2 xl:px-3 pb-4 space-y-0.5 border-t border-border/40 pt-3">
          {secondaryItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
            if (requiresAuth && !isAuthenticated) return null;
            const isActive = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={
                  <Link
                    href={href}
                    className={cn(
                      'relative flex items-center gap-3.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-brand-dark/12 dark:bg-brand-medium/15 text-brand-dark dark:text-brand-medium'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    )}
                  />
                }>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden xl:block">{label}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden font-medium">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="flex items-center gap-3 w-full rounded-xl px-2 py-2 hover:bg-accent/60 transition-colors text-left outline-none cursor-pointer mt-1">
                  <Avatar className="w-8 h-8 shrink-0 ring-2 ring-brand-dark/20 dark:ring-brand-medium/30">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-dark/30 to-brand-medium/30 text-brand-dark dark:text-brand-medium text-xs font-bold">
                      {user.first_name?.[0] || user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground hidden xl:block shrink-0 ml-auto" />
                </button>
              } />
              <DropdownMenuContent align="start" className="w-[200px] mb-2 z-50 bg-card/95 backdrop-blur-xl border-border/80">
                <DropdownMenuItem render={<Link href={`/profile/${user.username}`} />}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/settings" />}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <div className="my-1 h-px bg-border/60" />
                <DropdownMenuItem
                  onClick={() => { dispatch(logout()); toast.success('Logged out successfully'); }}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="w-full justify-center xl:justify-start rounded-xl border-brand-dark/30 text-brand-dark dark:text-brand-medium dark:border-brand-medium/30 hover:bg-brand-dark/10">
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
