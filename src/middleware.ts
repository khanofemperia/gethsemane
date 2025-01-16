import { DecodedIdToken } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import appConfig from "@/lib/config";

const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const PUBLIC_ROUTES = [
  "/",
  "/api/auth/session",
  `/auth/admin/${ADMIN_ENTRY_KEY}`,
] as const;

const isAdmin = (decodedClaims: DecodedIdToken): boolean => {
  return (
    decodedClaims.email === ADMIN_EMAIL &&
    decodedClaims.role === "admin" &&
    decodedClaims.grantedThrough === "admin_entry"
  );
};

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname === route);
};

const verifySessionWithAPI = async (
  sessionCookie: string
): Promise<DecodedIdToken> => {
  const response = await fetch(`${appConfig.BASE_URL}/api/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionCookie }),
  });

  if (!response.ok) {
    throw new Error("Invalid session");
  }

  return response.json();
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle public routes first
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session cookie
  const session = request.cookies.get(COOKIE_NAME);

  // If no session cookie exists, redirect to home
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decodedClaims = await verifySessionWithAPI(session.value);

    // For admin routes, verify admin privileges
    if (pathname.startsWith("/admin")) {
      if (!isAdmin(decodedClaims)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Session is valid, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // Any verification error results in redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    // Protected routes
    "/admin/:path*",

    // Exclude all static files and API routes except admin paths
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|images).*)",
  ],
};
