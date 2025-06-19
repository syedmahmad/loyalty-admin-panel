import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Skip middleware for static files and API routes
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // const response = NextResponse.next();
  // response.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate');

  if (pathname === "/unsubscribe") {
    return NextResponse.next();
  }

  // Allow access to /logout, `/login` and `/petromin-auth` without a token
  // once user lands on /dahboard or any other route but his token expires as this expires in 7 days.
  // so user will redirect to /login page/
  if (!token) {
    // if (pathname === '/logout' || pathname === '/login' || pathname === '/petromin-auth') {
    //   return NextResponse.next();
    // } else {
    // }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL('/clients', req.url));
  }
  // If a token is present, allow access
  return NextResponse.next();
}

// Apply middleware to all routes except `/logout`, `/login` and `/petromin-auth`,
// while excluding static files and API routes.
export const config = {
  matcher: [
    '/((?!login|logout|petromin-auth|unsubscribe|_next/static|api).*)',
  ],
};
