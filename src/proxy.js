import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Next.js 16 "proxy" (the new name for middleware).
// Fast, optimistic gate: logged-out visitors are redirected before any page JS is
// sent. Real authorization still happens inside every API route (requireUser).
export function proxy(request) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*"],
};
