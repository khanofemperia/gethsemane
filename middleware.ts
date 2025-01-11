import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { DecodedIdToken } from "firebase-admin/auth";

// Constants
const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_ENTRY_POINT = `/admin/${ADMIN_ENTRY_KEY}`;

const PROTECTED_ROUTES = [
  // Add protected routes here in the future
  // "/profile",
  // "/wishlist",
  // etc.
] as const;

// Helper functions
const createRedirectResponse = (url: URL, deleteCookie: boolean = false) => {
  const response = NextResponse.redirect(url);
  if (deleteCookie) {
    response.cookies.delete(COOKIE_NAME);
  }
  return response;
};

const verifySession = async (
  sessionCookie: string
): Promise<DecodedIdToken> => {
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    throw new Error("Invalid session");
  }
};

const isAdmin = (decodedClaims: DecodedIdToken): boolean => {
  return decodedClaims.email === ADMIN_EMAIL;
};

const attachUserToRequest = (
  request: NextRequest,
  decodedClaims: DecodedIdToken
) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "user",
    JSON.stringify({
      ...decodedClaims,
      isAdmin: isAdmin(decodedClaims),
    })
  );
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
};

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME);
  const { pathname, search } = request.nextUrl;

  // Handle admin entry point
  if (pathname === ADMIN_ENTRY_POINT) {
    if (!session) {
      const googleSignInUrl = new URL("/auth/google", request.url);
      googleSignInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(googleSignInUrl);
    }

    try {
      const decodedClaims = await verifySession(session.value);

      if (isAdmin(decodedClaims)) {
        // If admin, redirect to admin panel
        return NextResponse.redirect(new URL("/admin", request.url));
      } else {
        // If not admin, redirect to home and clear session
        return createRedirectResponse(new URL("/", request.url), true);
      }
    } catch {
      return createRedirectResponse(new URL("/auth/google", request.url), true);
    }
  }

  // Handle all admin routes
  if (pathname.startsWith("/admin") && pathname !== ADMIN_ENTRY_POINT) {
    if (!session) {
      // If no session, redirect to admin entry point
      return NextResponse.redirect(new URL(ADMIN_ENTRY_POINT, request.url));
    }

    try {
      const decodedClaims = await verifySession(session.value);

      if (!isAdmin(decodedClaims)) {
        // If not admin, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }

      return attachUserToRequest(request, decodedClaims);
    } catch {
      return createRedirectResponse(
        new URL(ADMIN_ENTRY_POINT, request.url),
        true
      );
    }
  }

  // Handle protected routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const decodedClaims = await verifySession(session.value);
      return attachUserToRequest(request, decodedClaims);
    } catch {
      return createRedirectResponse(new URL("/auth/signin", request.url), true);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    ...PROTECTED_ROUTES.map((route) => `${route}/:path*`),
  ],
};
