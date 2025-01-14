// api/auth/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cherlygood_session";

export async function POST() {
  try {
    cookies().delete(COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
