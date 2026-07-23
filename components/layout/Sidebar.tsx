'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Search, Bell, MessageCircle, Bookmark, User,
  Settings, PlusSquare, TrendingUp, LogOut, Compass, MoreHorizontal,
  PanelLeftClose, PanelLeftOpen, Menu, PlaySquare, Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import Logo from '@/components/shared/Logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/features/auth/authSlice';
import { toggleSidebar } from '@/lib/features/ui/uiSlice';
import { toast } from 'sonner';
import { useGetNotificationUnreadCountQuery as useGetNotificationsUnreadCountQuery } from '@/lib/features/notification/notificationApi';
import { useGetChatUnreadCountQuery } from '@/lib/features/chat/chatApi';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/reels', icon: PlaySquare, label: 'Reels' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/suggested', icon: Users, label: 'Suggested Users', auth: true },
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
  
  const isCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);
  
  const { data: notificationData } = useGetNotificationsUnreadCountQuery(undefined, { skip: !isAuthenticated, pollingInterval: 30000 });
  const { data: chatData } = useGetChatUnreadCountQuery(undefined, { skip: !isAuthenticated, pollingInterval: 30000 });
  
  const unreadCount = notificationData?.count || 0;
  const chatUnreadCount = chatData?.count || 0;

  return (
    <TooltipProvider delay={0}>
      <aside className={cn(
        "sticky top-0 h-screen border-r border-border/40 flex flex-col bg-[#1a1a1a] z-30 shrink-0 transition-all duration-300",
        isCollapsed ? "w-[68px]" : "w-[68px] xl:w-[248px]"
      )}>
        {/* Logo and Toggle Header */}
        <div className={cn("h-16 flex items-center border-b border-border/40 transition-all duration-300 group/header relative", isCollapsed ? "justify-center px-0" : "px-3 xl:px-5 justify-between")}>
          <Link href="/" className={cn("flex items-center group/logo transition-opacity duration-200", isCollapsed && "group-hover/header:opacity-0")}>
            {isCollapsed ? (
              <Logo imageClassName="h-8" collapsed={true} />
            ) : (
              <>
                <Logo className="xl:hidden" imageClassName="h-8" collapsed={true} />
                <Logo className="hidden xl:flex" imageClassName="h-8" />
              </>
            )}
          </Link>

          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebar())}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-opacity duration-200 z-10",
                  isCollapsed 
                    ? "absolute inset-0 m-auto opacity-0 group-hover/header:opacity-100" 
                    : "hidden xl:flex opacity-0 group-hover/header:opacity-100 shrink-0"
                )}
              >
                {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </Button>
            } />
            <TooltipContent side="right" className="font-medium">
              {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 xl:px-3 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
            if (requiresAuth && !isAuthenticated) return null;
            const isActive = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={
                  <Link
                    href={href}
                    className={cn(
                      'group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                      isCollapsed 
                        ? 'justify-center px-0' 
                        : 'justify-center px-0 xl:justify-start xl:px-3 xl:gap-3.5',
                      isActive
                        ? 'bg-brand-dark/10 dark:bg-brand-medium/12 text-brand-dark dark:text-brand-medium ring-1 ring-brand-dark/10 dark:ring-brand-medium/10'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  />
                }>
                  {/* Active left accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-dark dark:bg-brand-medium rounded-r-full" />
                  )}
                  <Icon className={cn(
                    'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-brand-dark dark:text-brand-medium' : ''
                  )} />
                  <span className={cn("truncate transition-all duration-300 flex-1", isCollapsed ? "hidden" : "hidden xl:block")}>
                    {label}
                  </span>
                  
                  {href === '/notifications' && unreadCount > 0 && (
                    <span className={cn(
                      "ml-auto items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-destructive rounded-full",
                      isCollapsed ? "hidden" : "hidden xl:flex"
                    )}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                  {href === '/notifications' && unreadCount > 0 && (
                    <span className={cn(
                      "absolute top-1 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background",
                      isCollapsed ? "block" : "block xl:hidden"
                    )} />
                  )}
                  
                  {href === '/messages' && chatUnreadCount > 0 && (
                    <span className={cn(
                      "ml-auto items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-brand-dark dark:bg-brand-medium rounded-full",
                      isCollapsed ? "hidden" : "hidden xl:flex"
                    )}>
                      {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                    </span>
                  )}
                  {href === '/messages' && chatUnreadCount > 0 && (
                    <span className={cn(
                      "absolute top-1 right-2 w-2.5 h-2.5 bg-brand-dark dark:bg-brand-medium rounded-full border-2 border-background",
                      isCollapsed ? "block" : "block xl:hidden"
                    )} />
                  )}

                </TooltipTrigger>
                <TooltipContent side="right" className={cn("font-medium", !isCollapsed && "xl:hidden")}>
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
                    className={cn(
                      "group flex items-center rounded-xl py-2.5 text-sm font-semibold bg-gradient-to-r from-brand-dark to-brand-medium text-white hover:opacity-90 active:scale-95 transition-all duration-200 shadow-md shadow-brand-dark/20",
                      isCollapsed 
                        ? "justify-center px-0" 
                        : "justify-center px-0 xl:justify-start xl:px-3 xl:gap-3.5"
                    )}
                  />
                }>
                  <PlusSquare className="w-5 h-5 shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span className={cn("transition-all duration-300 whitespace-nowrap", isCollapsed ? "hidden" : "hidden xl:block")}>Create Post</span>
                </TooltipTrigger>
                <TooltipContent side="right" className={cn("font-medium", !isCollapsed && "xl:hidden")}>
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
                      'relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200',
                      isCollapsed 
                        ? 'justify-center px-0' 
                        : 'justify-center px-0 xl:justify-start xl:px-3 xl:gap-3.5',
                      isActive
                        ? 'bg-brand-dark/12 dark:bg-brand-medium/15 text-brand-dark dark:text-brand-medium'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                    )}
                  />
                }>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className={cn("truncate transition-all duration-300", isCollapsed ? "hidden" : "hidden xl:block")}>{label}</span>
                </TooltipTrigger>
                <TooltipContent side="right" className={cn("font-medium", !isCollapsed && "xl:hidden")}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className={cn(
                  "flex items-center w-full rounded-xl py-2 hover:bg-accent/60 transition-colors text-left outline-none cursor-pointer mt-1",
                  isCollapsed ? "justify-center px-0" : "justify-center px-0 xl:justify-start xl:px-2 xl:gap-3"
                )}>
                  <Avatar className="w-8 h-8 shrink-0 ring-2 ring-brand-dark/20 dark:ring-brand-medium/30">
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-dark/30 to-brand-medium/30 text-brand-dark dark:text-brand-medium text-xs font-bold">
                      {user.first_name?.[0] || user.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("min-w-0 flex-1 transition-all duration-300", isCollapsed ? "hidden" : "hidden xl:block")}>
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>
                  <MoreHorizontal className={cn("w-4 h-4 text-muted-foreground shrink-0 ml-auto transition-all duration-300", isCollapsed ? "hidden" : "hidden xl:block")} />
                </button>
              } />
              <DropdownMenuContent align={isCollapsed ? "center" : "start"} sideOffset={12} className="w-[200px] mb-2 z-50 bg-card/95 backdrop-blur-xl border-border/80">
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
                  <LogOut className={cn("w-4 h-4 transition-all duration-300", isCollapsed ? "mr-0" : "xl:mr-2")} />
                  <span className={cn("transition-all duration-300", isCollapsed ? "hidden" : "hidden xl:inline")}>Log In</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
