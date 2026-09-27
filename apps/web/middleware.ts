import { NextRequest, NextResponse } from 'next/server';

const ROLE_HIERARCHY: Record<string, number> = {
  patient: 1,
  doctor: 2,
  researcher: 3,
  admin: 4,
  super_admin: 5,
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/' || pathname.match(/\.(.*)$/)) {
    return NextResponse.next();
  }

  // Fetch session
  const cookieHeader = req.headers.get('cookie') || '';
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5007'}/api/auth/get-session`, {
    headers: { cookie: cookieHeader }
  });

  const sessionData = await res.json().catch(() => null);
  const user = sessionData?.user;

  // 1. Unauthenticated users cannot access (app) routes
  if (!user && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up') && !pathname.startsWith('/forgot-password') && !pathname.startsWith('/reset-password')) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // 2. Authenticated users
  if (user) {
    if (user.status === 'banned' || user.status === 'suspended') {
      if (pathname !== '/blocked') return NextResponse.redirect(new URL('/blocked', req.url));
      return NextResponse.next();
    }

    if (user.requiresPasswordReset && pathname !== '/reset-password') {
      return NextResponse.redirect(new URL('/reset-password', req.url));
    }

    // Redirect away from auth pages
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
      const dashboard = `/${user.role.replace('_', '-')}`;
      return NextResponse.redirect(new URL(dashboard, req.url));
    }

    // Role-based protection
    if (pathname.startsWith('/patient') && user.role !== 'patient') return NextResponse.redirect(new URL('/', req.url));
    if (pathname.startsWith('/doctor') && user.role !== 'doctor') return NextResponse.redirect(new URL('/', req.url));
    if (pathname.startsWith('/researcher') && user.role !== 'researcher') return NextResponse.redirect(new URL('/', req.url));
    
    if (pathname.startsWith('/admin') && user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (pathname.startsWith('/super-admin') && user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}
