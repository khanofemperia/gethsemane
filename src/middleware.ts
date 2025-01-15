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

  // Always redirect /admin routes to home if no valid session
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get(COOKIE_NAME);

    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const decodedClaims = await verifySessionWithAPI(session.value);

      // If not admin or invalid claims, redirect to home
      if (!isAdmin(decodedClaims)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Any verification error results in redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle other authenticated routes here
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    "/admin/:path*",
  ],
};
