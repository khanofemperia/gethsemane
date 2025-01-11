import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY; // From the .env file
const ADMIN_ENTRY_POINT = `/admin/${ADMIN_ENTRY_KEY}`; // The correct path for accessing the admin panel

// Protected routes that require authentication (e.g., /profile and any future protected pages)
const PROTECTED_ROUTES = [
  "/profile", // Example protected route
  // Add other protected routes here in the future
];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME);
  const { pathname, search } = request.nextUrl;

  // Handle the special /admin/admin-entry-key route
  if (pathname === ADMIN_ENTRY_POINT) {
    // If no session, redirect to Google sign-in
    if (!session) {
      // Redirect to Google Sign-In (or the route you use for Google login)
      const googleSignInUrl = new URL('/auth/google', request.url);
      googleSignInUrl.searchParams.set('callbackUrl', pathname + search);
      return NextResponse.redirect(googleSignInUrl);
    }

    try {
      // Verify session with Google
      const decodedClaims = await adminAuth.verifySessionCookie(session.value, true);
      
      // If session is valid, redirect to the admin dashboard
      const adminUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(adminUrl);
    } catch (error) {
      // If the session is invalid, log them out and redirect to Google sign-in
      const response = NextResponse.redirect(new URL("/auth/google", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Handle admin routes that require authentication
  if (pathname.startsWith("/admin")) {
    if (!session) {
      // If no session, redirect to admin entry path
      const signInUrl = new URL(ADMIN_ENTRY_POINT, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(session.value, true);

      // Verify admin role
      if (!decodedClaims.admin) {
        // If not admin, redirect to homepage without showing signin
        return NextResponse.redirect(new URL("/", request.url));
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user", JSON.stringify(decodedClaims));
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      const response = NextResponse.redirect(new URL("/admin/signin", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // Handle regular protected routes (e.g., /profile, etc.)
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const decodedClaims = await adminAuth.verifySessionCookie(session.value, true);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("user", JSON.stringify(decodedClaims));
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (error) {
      const response = NextResponse.redirect(new URL("/auth/signin", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // All admin routes
    "/profile/:path*", // Protected routes like profile
    // Add other protected routes in the future
  ],
};
