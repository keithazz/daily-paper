import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }

  if (!isAuthPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Exclude API routes, Next.js internals, and static files from middleware.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
