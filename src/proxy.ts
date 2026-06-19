import { getSessionCookie } from "better-auth/cookies"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedPrefixes = [
  "/feed",
  "/favorites",
  "/direct",
  "/settings",
  "/onboarding",
  "/u/",
]

export function proxy(request: NextRequest) {
  const session = getSessionCookie(request)
  const { pathname } = request.nextUrl

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/sign-up", request.url))
  }

  if (session && (pathname === "/sign-up" || pathname === "/")) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/favorites/:path*",
    "/direct/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/u/:path*",
    "/sign-up",
    "/",
  ],
}
