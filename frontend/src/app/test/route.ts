import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const redirectUrl = new URL("/dashboard", request.nextUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("test_bypass", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // No maxAge / expires = persists until browser clears cookies
    maxAge: 60 * 60 * 24 * 365 * 10, // ~10 years
  });

  return response;
}
