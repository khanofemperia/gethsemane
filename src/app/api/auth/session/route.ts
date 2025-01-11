import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

const COOKIE_NAME = "cherlygood_session";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    // Create session cookie that lasts for 3 months
    const threeMonthsInMilliseconds = 60 * 60 * 24 * 90 * 1000; // 90 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: threeMonthsInMilliseconds,
    });

    // Set cookie
    cookies().set(COOKIE_NAME, sessionCookie, {
      maxAge: threeMonthsInMilliseconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
