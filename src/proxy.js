import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";


export function proxy(request) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*"],
};
