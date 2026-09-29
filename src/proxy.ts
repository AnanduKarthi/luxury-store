import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

// Optimistic check only: redirects visitors with no session cookie before any
// rendering. It can't tell a valid session from an expired or forged one, so
// pages and actions still call requireSession/requireAdmin (src/lib/session.ts).
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/success"],
};
