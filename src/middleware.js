import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If user is logged in and tries to access login page, redirect to dashboard
  if (token && pathname === '/nurse/login') {
    return NextResponse.redirect(new URL('/nurse/dashboard', request.url));
  }

  // 2. If user is NOT logged in and tries to access private nurse routes, redirect to login
  const isProtectedRoute = pathname.startsWith('/nurse') && pathname !== '/nurse/login';
  
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/nurse/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/nurse/:path*'],
};
