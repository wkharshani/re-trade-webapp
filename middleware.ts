import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/seller/') || pathname.startsWith('/buyer/')) {
    if (pathname.startsWith('/seller/')) {
      return NextResponse.redirect(new URL('/login?redirect=/seller/dashboard', request.url));
    } else if (pathname.startsWith('/buyer/')) {
      return NextResponse.redirect(new URL('/login?redirect=/buyer/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/seller/:path*',
    '/buyer/:path*',
  ],
};
