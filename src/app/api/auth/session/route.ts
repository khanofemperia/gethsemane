import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  console.log("Session API route called");

  try {
    const body = await request.json();
    const entryPoint = request.headers.get("X-Entry-Point") || "";

    console.log("Received request:", {
      idTokenLength: body.idToken?.length ?? 0,
      entryPoint,
    });

    if (!body.idToken) {
      console.log("No idToken provided");
      return NextResponse.json(
        { error: "No ID token provided" },
        { status: 400 }
      );
    }

    // Verify the ID token first
    const decodedToken = await adminAuth.verifyIdToken(body.idToken);
    const isAdminEmail = decodedToken.email === ADMIN_EMAIL;
    const isAdminEntryPoint = entryPoint.includes(`/admin/${ADMIN_ENTRY_KEY}`);

    // Deny access if admin tries regular sign-in or non-admin tries admin entry
    if (
      (isAdminEmail && !isAdminEntryPoint) ||
      (!isAdminEmail && isAdminEntryPoint)
    ) {
      return NextResponse.json(
        { error: "Invalid authentication path" },
        { status: 403 }
      );
    }

    // Handle admin authentication
    if (isAdminEmail && isAdminEntryPoint) {
      await adminAuth.setCustomUserClaims(decodedToken.uid, {
        role: "admin",
        grantedAt: Date.now(),
        grantedThrough: "admin_entry",
      });
    } else {
      // Set regular user claims
      await adminAuth.setCustomUserClaims(decodedToken.uid, {
        role: "customer",
        grantedAt: Date.now(),
      });
    }

    // Create session only if all checks pass
    const twoWeeksInMilliseconds = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(body.idToken, {
      expiresIn: twoWeeksInMilliseconds,
    });

    cookies().set(COOKIE_NAME, sessionCookie, {
      maxAge: twoWeeksInMilliseconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in session route:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
