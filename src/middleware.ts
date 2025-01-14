// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";
import appConfig from "@/lib/config";

// Constants
const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_ENTRY_POINT = `/admin/${ADMIN_ENTRY_KEY}`;

const PROTECTED_ROUTES = [] as const;
const PUBLIC_ROUTES = [
  "/",
  "/auth/signin",
  "/auth/google",
  "/api/auth/session",
] as const;

interface UserState {
  decodedClaims: DecodedIdToken;
  isAdmin: boolean;
}

const createRedirectResponse = (url: URL, deleteCookie: boolean = false) => {
  const response = NextResponse.redirect(url);
  if (deleteCookie) {
    response.cookies.delete(COOKIE_NAME);
  }
  return response;
};

const isAdmin = (decodedClaims: DecodedIdToken): boolean => {
  return (
    decodedClaims.email === ADMIN_EMAIL &&
    decodedClaims.role === "admin" &&
    decodedClaims.grantedThrough === "admin_entry"
  );
};

const attachUserToRequest = (request: NextRequest, userState: UserState) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("user", JSON.stringify(userState));
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
};

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
};

const handleAuthError = (
  request: NextRequest,
  error: unknown
): NextResponse => {
  console.error("Auth error in middleware:", error);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return createRedirectResponse(
      new URL(ADMIN_ENTRY_POINT, request.url),
      true
    );
  }

  const signInUrl = new URL("/auth/signin", request.url);
  signInUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
  return createRedirectResponse(signInUrl, true);
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
  const { pathname, search } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME);

  if (pathname === ADMIN_ENTRY_POINT) {
    if (!session) {
      const googleSignInUrl = new URL("/auth/google", request.url);
      googleSignInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(googleSignInUrl);
    }

    try {
      const decodedClaims = await verifySessionWithAPI(session.value);
      if (isAdmin(decodedClaims)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return createRedirectResponse(new URL("/", request.url), true);
    } catch (error) {
      return handleAuthError(request, error);
    }
  }

  if (pathname.startsWith("/admin") && pathname !== ADMIN_ENTRY_POINT) {
    if (!session) {
      return NextResponse.redirect(new URL(ADMIN_ENTRY_POINT, request.url));
    }

    try {
      const decodedClaims = await verifySessionWithAPI(session.value);
      const userState: UserState = {
        decodedClaims,
        isAdmin: isAdmin(decodedClaims),
      };

      if (!userState.isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return attachUserToRequest(request, userState);
    } catch (error) {
      return handleAuthError(request, error);
    }
  }

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const decodedClaims = await verifySessionWithAPI(session.value);
      const userState: UserState = {
        decodedClaims,
        isAdmin: isAdmin(decodedClaims),
      };
      return attachUserToRequest(request, userState);
    } catch (error) {
      return handleAuthError(request, error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    "/admin/:path*",
  ],
};
