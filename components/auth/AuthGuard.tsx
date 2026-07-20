'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const PROTECTED_ROUTES = [
  '/settings',
  '/create',
  '/messages',
  '/notifications',
  '/saved',
];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * AuthGuard — wraps all (main) layout pages.
 * Redirects unauthenticated users to /login for protected routes.
 * Shows a loading spinner while hydrating auth state from localStorage for protected routes.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  // On first render, Redux state is not yet hydrated from localStorage.
  // We use a brief "checking" state to avoid a flash of redirect.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give StoreProvider's useEffect time to restore credentials from localStorage
    const timer = setTimeout(() => {
      setChecking(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const isProtected = isProtectedRoute(pathname);

  useEffect(() => {
    if (isProtected && !checking && !isAuthenticated && !accessToken) {
      // Preserve the intended destination so we can redirect back after login
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
    }
  }, [isProtected, checking, isAuthenticated, accessToken, router, pathname]);

  // If it's a public route, render immediately (no spinner or redirect checks)
  if (!isProtected) {
    return <>{children}</>;
  }

  // While checking localStorage hydration on a protected route, show a full-screen spinner
  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-brand-medium/20" />
          <Loader2 className="w-10 h-10 animate-spin text-brand-medium absolute inset-0" />
        </div>
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  // Not authenticated on a protected route — show nothing (redirect is in-flight)
  if (!isAuthenticated && !accessToken) {
    return null;
  }

  return <>{children}</>;
}

