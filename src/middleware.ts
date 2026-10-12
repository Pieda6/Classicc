import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const AUTH_PAGES = ["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL(`/account/login?next=${encodeURIComponent(pathname + search)}`, req.url));
    if (session.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/account") && !AUTH_PAGES.some((p) => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL(`/account/login?next=${encodeURIComponent(pathname)}`, req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
