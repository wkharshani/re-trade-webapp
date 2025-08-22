import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has a valid session cookie
  const sessionCookie = request.cookies.get('re-trade-session');
  
  // If accessing protected routes without session, redirect to login
  if (pathname.startsWith('/seller/') || pathname.startsWith('/buyer/')) {
    if (!sessionCookie?.value) {
      // No session cookie found, redirect to login
      if (pathname.startsWith('/seller/')) {
        return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
      } else if (pathname.startsWith('/buyer/')) {
        return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(pathname), request.url));
      }
    }
    
    // Session cookie exists, let the request proceed
    // The actual authentication will be handled by the server components using requireSellerAuth/requireBuyerAuth
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/seller/:path*',
    '/buyer/:path*',
  ],
};
