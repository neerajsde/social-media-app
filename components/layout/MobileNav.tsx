'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusSquare, Bell, User, Compass } from 'lucide-react';
import { useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/create', icon: PlusSquare, label: 'Create', auth: true, accent: true },
  { href: '/notifications', icon: Bell, label: 'Alerts', auth: true },
  { href: '/profile', icon: User, label: 'Profile', auth: true },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {mobileNavItems.map(({ href, icon: Icon, label, auth: requiresAuth, accent }) => {
          if (requiresAuth && !isAuthenticated) {
            if (label === 'Create') return null;
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
                'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
                accent && 'text-brand-dark dark:text-brand-medium',
                isActive ? 'text-brand-dark dark:text-brand-medium' : 'text-muted-foreground',
              )}
            >
              <Icon className={cn('w-5 h-5', accent && 'w-6 h-6')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
