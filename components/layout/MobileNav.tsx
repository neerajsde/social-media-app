'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageCircle, Bell, User, Compass, PlaySquare, Plus, Menu, Bookmark, Settings, LogOut, Users } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { useGetChatUnreadCountQuery } from '@/lib/features/chat/chatApi';
import { useGetNotificationUnreadCountQuery } from '@/lib/features/notification/notificationApi';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { logout } from '@/lib/features/auth/authSlice';
import Logo from '@/components/shared/Logo';
import { toast } from 'sonner';

const bottomNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/reels', icon: PlaySquare, label: 'Reels' },
  { href: '/messages', icon: MessageCircle, label: 'Message', auth: true },
];

const allNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/reels', icon: PlaySquare, label: 'Reels' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/suggested', icon: Users, label: 'Suggested Users', auth: true },
  { href: '/notifications', icon: Bell, label: 'Notifications', auth: true },
  { href: '/messages', icon: MessageCircle, label: 'Messages', auth: true },
  { href: '/saved', icon: Bookmark, label: 'Saved', auth: true },
  { href: '/settings', icon: Settings, label: 'Settings', auth: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  // Close sheet on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const { data: chatData } = useGetChatUnreadCountQuery(undefined, { skip: !isAuthenticated });
  const chatUnreadCount = chatData?.count || 0;
  
  const { data: notifData } = useGetNotificationUnreadCountQuery(undefined, { skip: !isAuthenticated });
  const unreadCount = notifData?.count || 0;

  return (
    <>
      {/* Floating Action Button for Create Post */}
      {(pathname === '/' || pathname.startsWith('/profile')) && (
        <Link 
          href={isAuthenticated ? '/create' : '/login'}
          className="md:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-[#00D084] text-black rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,208,132,0.4)] transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-7 h-7" />
        </Link>
      )}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14 px-1">
          {bottomNavItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
            if (requiresAuth && !isAuthenticated) return null;
            
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors relative flex-1',
                  isActive ? 'text-brand-dark dark:text-brand-medium' : 'text-muted-foreground',
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} strokeWidth={isActive ? 2.5 : 2} />
                  {href === '/messages' && chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                  )}
                </div>
              </Link>
            );
          })}
          
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground relative flex-1">
              <Menu className="w-6 h-6" strokeWidth={2} />
              {(unreadCount > 0) && (
                <span className="absolute top-1.5 right-1/4 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
              )}
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-background/95 backdrop-blur-xl border-r border-border/40 flex flex-col">
              <SheetHeader className="p-4 border-b border-border/40 text-left">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Link href="/" className="inline-block" onClick={() => setOpen(false)}>
                  <Logo imageClassName="h-8" />
                </Link>
              </SheetHeader>
              
              {isAuthenticated && user && (
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3 p-4 border-b border-border/40 hover:bg-accent/50 transition-colors">
                  <User className="w-10 h-10 p-2 bg-brand-dark/10 text-brand-dark rounded-full shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user.first_name || user.username}</p>
                    <p className="text-xs text-muted-foreground truncate">View Profile</p>
                  </div>
                </Link>
              )}

              <div className="flex-1 overflow-y-auto py-2">
                <div className="flex flex-col px-2 gap-1">
                  {allNavItems.map(({ href, icon: Icon, label, auth: requiresAuth }) => {
                    if (requiresAuth && !isAuthenticated) return null;
                    const isActive = pathname === href;
                    
                    return (
                      <Link 
                        key={href} 
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                          isActive ? "bg-brand-dark/10 text-brand-dark font-medium" : "hover:bg-accent/50 text-foreground/80"
                        )}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span className="flex-1">{label}</span>
                        {href === '/notifications' && unreadCount > 0 && (
                          <span className="bg-destructive text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                        {href === '/messages' && chatUnreadCount > 0 && (
                          <span className="bg-brand-dark text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {isAuthenticated ? (
                <div className="p-4 border-t border-border/40">
                  <button 
                    onClick={() => {
                      dispatch(logout());
                      toast.success('Logged out successfully');
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 border-t border-border/40">
                  <Link href="/login" className="flex items-center gap-3 w-full px-3 py-3 text-brand-dark hover:bg-brand-dark/10 rounded-xl transition-colors font-medium">
                    <LogOut className="w-5 h-5" />
                    Log In
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
