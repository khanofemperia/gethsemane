import { DecodedIdToken } from "firebase-admin/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import appConfig from "@/lib/config";

const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY || "";
if (!ADMIN_ENTRY_KEY) {
  throw new Error("ADMIN_ENTRY_KEY environment variable is required");
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
if (!ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable is required");
}

const PROTECTED_ROUTES = [
  "/admin",
  "/admin/:path*", // All admin subpaths
  "/demo", // Example of another protected route
] as const;

class SessionVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionVerificationError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

const isAdmin = (decodedClaims: DecodedIdToken): boolean => {
  return (
    decodedClaims.email === ADMIN_EMAIL &&
    decodedClaims.role === "admin" &&
    decodedClaims.grantedThrough === "admin_entry"
  );
};

const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => {
    if (route.includes(":path*")) {
      // Handle wildcard paths
      const basePath = route.split("/:path*")[0];
      return pathname.startsWith(basePath);
    }
    return pathname === route;
  });
};

const isValidAdminEntryKey = (pathname: string): boolean => {
  const adminEntryPattern = /^\/auth\/admin\/(.*)$/;
  const match = pathname.match(adminEntryPattern);

  if (match) {
    const providedKey = match[1];
    return providedKey === ADMIN_ENTRY_KEY;
  }
  return false;
};

const verifySessionWithAPI = async (
  sessionCookie: string
): Promise<DecodedIdToken> => {
  try {
    const response = await fetch(`${appConfig.BASE_URL}/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionCookie }),
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new SessionVerificationError(
        `Invalid session: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error: unknown) {
    if (
      error instanceof TypeError ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new NetworkError("Failed to verify session: Network error");
    }
    throw error;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for admin entry key route
  if (pathname.startsWith("/auth/admin/")) {
    if (!isValidAdminEntryKey(pathname)) {
      // Redirect invalid keys to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If not a protected route, allow access
  if (!isProtectedRoute(pathname)) {
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
        // Redirect unauthorized admin attempts to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Session is valid, allow request to proceed
    return NextResponse.next();
  } catch (error) {
    // Handle different types of errors
    if (error instanceof NetworkError) {
      // For network errors, you might want to show a different page or retry
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (error instanceof SessionVerificationError) {
      // Invalid or expired sessions redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Unknown errors redirect to error page
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    // Protected routes including demo
    "/admin/:path*",
    "/demo",
    // Add admin entry key route pattern
    "/auth/admin/:key*",
    // Exclude all static files and API routes except admin paths
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|images).*)",
  ],
};
