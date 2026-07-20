import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (account-specific actions)
const PROTECTED_ROUTES = [
  '/settings',
  '/create',
  '/messages',
  '/notifications',
  '/saved',
];

// Routes only accessible to guests (redirect logged-in users away)
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the auth token cookie (set by authSlice on login)
  const token = request.cookies.get('accessToken')?.value;
  const isLoggedIn = Boolean(token);

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from auth pages
  if (isAuthRoute(pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)',
  ],
};
