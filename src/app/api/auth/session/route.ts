import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = "cherlygood_session";
const ADMIN_ENTRY_KEY = process.env.ADMIN_ENTRY_KEY || ""; // Provide default empty string
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function POST(request: NextRequest) {
  console.log("Session API route called");

  try {
    const body = await request.json();
    const entryPoint = request.headers.get("X-Entry-Point") || ""; // Provide default empty string

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

    try {
      // First verify the ID token
      const decodedToken = await adminAuth.verifyIdToken(body.idToken);

      // Now ADMIN_ENTRY_KEY and entryPoint are guaranteed to be strings
      const isAdminEntryPoint = entryPoint.includes(ADMIN_ENTRY_KEY);

      if (decodedToken.email === ADMIN_EMAIL) {
        if (!isAdminEntryPoint) {
          return NextResponse.json(
            {
              error: "Admin access requires proper authentication path",
            },
            { status: 403 }
          );
        }

        // Set admin claims only if coming through proper path
        await adminAuth.setCustomUserClaims(decodedToken.uid, {
          role: "admin",
          grantedAt: Date.now(),
          grantedThrough: "admin_entry",
        });

        // Get a fresh token with the new claims
        const freshToken = await adminAuth.createCustomToken(decodedToken.uid);
        body.idToken = freshToken;
      } else {
        // Set regular user claims
        await adminAuth.setCustomUserClaims(decodedToken.uid, {
          role: "customer",
          grantedAt: Date.now(),
        });
      }

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

      console.log("Session created successfully");
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error("Error creating session:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error in session route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
