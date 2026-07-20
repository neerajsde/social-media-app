'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bell, MessageCircle, Bookmark, User, Settings, PlusSquare, TrendingUp, LogOut, Compass, MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
                <TooltipTrigger render={
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  />
                }>
                  <Icon className={cn('w-5 h-5 shrink-0', isActive && 'text-brand-dark dark:text-brand-medium')} />
                  <span className="hidden xl:block">{label}</span>
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
                <TooltipTrigger render={
                  <Link
                    href="/create"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-brand-dark text-brand-lightest hover:bg-brand-dark/90 transition-colors"
                  />
                }>
                  <PlusSquare className="w-5 h-5 shrink-0" />
                  <span className="hidden xl:block">Create Post</span>
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
                <TooltipTrigger render={
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-brand-dark/10 text-brand-dark dark:bg-brand-medium/20 dark:text-brand-lightest'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  />
                }>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="hidden xl:block">{label}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          <Separator className="my-2" />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="flex items-center gap-3 w-full rounded-lg px-2 py-1.5 hover:bg-accent transition-colors text-left outline-none cursor-pointer">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className="bg-brand-medium text-brand-lightest text-xs">{user.first_name?.[0] || user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate leading-tight">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground hidden xl:block shrink-0 ml-auto" />
                </button>
              } />
              <DropdownMenuContent align="start" className="w-[200px] mb-2 z-50">
                <DropdownMenuItem render={<Link href={`/profile/${user.username}`} />}>
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/settings" />}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem onClick={() => { dispatch(logout()); toast.success('Logged out successfully'); }} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
