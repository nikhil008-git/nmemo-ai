import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = [
  "/home",
  "/playground",
  "/sources",
  "/connectors",
  "/keys",
  "/settings",
  // legacy
  "/dashboard",
  "/chat",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  if (pathname === "/chat" || pathname.startsWith("/chat/")) {
    return NextResponse.redirect(new URL("/playground", request.url));
  }

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie?.value) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/home/:path*",
    "/playground",
    "/playground/:path*",
    "/sources",
    "/sources/:path*",
    "/connectors",
    "/connectors/:path*",
    "/keys",
    "/keys/:path*",
    "/settings",
    "/settings/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/chat",
    "/chat/:path*",
  ],
};
