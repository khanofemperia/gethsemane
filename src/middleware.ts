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
  // "/api/auth/session",
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
  console.log("User attached to request:", userState);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
};

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => pathname === route);
};

const handleAuthError = (
  request: NextRequest,
  error: unknown
): NextResponse => {
  console.error("Auth error in middleware:", error);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    console.log("Redirecting to admin entry point due to auth error.");
    return createRedirectResponse(
      new URL(ADMIN_ENTRY_POINT, request.url),
      true
    );
  }

  console.log("Redirecting to sign-in page due to auth error.");
  return createRedirectResponse(new URL("/", request.url), true);
};

const verifySessionWithAPI = async (
  sessionCookie: string
): Promise<DecodedIdToken> => {
  console.log("Verifying session with API...");
  const response = await fetch(`${appConfig.BASE_URL}/api/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionCookie }),
  });

  if (!response.ok) {
    console.error("Session verification failed.");
    throw new Error("Invalid session");
  }

  console.log("Session verified successfully.");
  return response.json();
};

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  console.log("Middleware triggered for:", pathname);

  if (isPublicRoute(pathname)) {
    console.log("Public route accessed:", pathname);
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME);
  console.log("Session cookie:", session ? "Present" : "Not present");

  if (pathname === ADMIN_ENTRY_POINT) {
    if (!session) {
      console.log(
        "No session for admin entry point. Redirecting to Google sign-in."
      );
      const googleSignInUrl = new URL("/auth/google", request.url);
      googleSignInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(googleSignInUrl);
    }

    try {
      const decodedClaims = await verifySessionWithAPI(session.value);
      if (isAdmin(decodedClaims)) {
        console.log("Valid admin session. Redirecting to admin dashboard.");
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      console.log("Invalid admin session. Redirecting to home.");
      return createRedirectResponse(new URL("/", request.url), true);
    } catch (error) {
      return handleAuthError(request, error);
    }
  }

  if (pathname.startsWith("/admin")) {
    console.log("Admin route accessed:", pathname);

    if (!session) {
      console.log(
        "No session for protected admin route. Redirecting to admin entry point."
      );
      return NextResponse.redirect(new URL("/", request.url));
    }

    try {
      const decodedClaims = await verifySessionWithAPI(session.value);
      const userState: UserState = {
        decodedClaims,
        isAdmin: isAdmin(decodedClaims),
      };

      if (!userState.isAdmin) {
        console.log("User is not admin. Redirecting to home.");
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log("User is admin. Granting access to admin route.");
      return attachUserToRequest(request, userState);
    } catch (error) {
      return handleAuthError(request, error);
    }
  }

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session) {
      console.log(
        "No session for protected route. Redirecting to sign-in page."
      );
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
      console.log("Valid session for protected route. Granting access.");
      return attachUserToRequest(request, userState);
    } catch (error) {
      return handleAuthError(request, error);
    }
  }

  console.log("Route not matched. Proceeding as next.");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    "/admin/:path*", // Matches all admin routes
  ],
};
