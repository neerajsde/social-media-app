'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MessageCircle, Bell, User, Compass } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { useGetUnreadCountQuery as useGetChatUnreadCountQuery } from '@/lib/features/chat/chatApi';

const mobileNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/messages', icon: MessageCircle, label: 'Message', auth: true },
  { href: '/profile', icon: User, label: 'Profile', auth: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const { data: chatData } = useGetChatUnreadCountQuery(undefined, { skip: !isAuthenticated, pollingInterval: 30000 });
  const chatUnreadCount = chatData?.count || 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {mobileNavItems.map(({ href, icon: Icon, label, auth: requiresAuth, accent }) => {
          if (requiresAuth && !isAuthenticated) {
            if (label === 'Message') return null;
            return (
              <Link key={href} href="/login" className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground">
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          }

          const profileHref = label === 'Profile' && user ? `/profile/${user.username}` : href;
          const isActive = pathname === profileHref || pathname === href;

          return (
            <Link
              key={href}
              href={profileHref}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors relative',
                accent && 'text-brand-dark dark:text-brand-medium',
                isActive ? 'text-brand-dark dark:text-brand-medium' : 'text-muted-foreground',
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', accent && 'w-6 h-6')} />
                {href === '/messages' && chatUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
