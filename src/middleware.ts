import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('%40jwt')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === '/login' || pathname.startsWith('/token/');

  // If the user is logged in and tries to access a public-only route like login,
  // redirect them to the home page.
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is not logged in and tries to access a protected route,
  // redirect them to the login page.
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, allow the request to proceed.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (e.g., /globe.svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.svg$).*)',
  ],
}
