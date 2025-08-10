import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("tv_session")?.value;
  const url = req.nextUrl.clone();

  const isAuthPage = url.pathname.startsWith("/signin") || url.pathname.startsWith("/signup");
  const protectedMember = url.pathname.startsWith("/member");
  const isAdminSignin = url.pathname === "/admin/signin";
  const protectedAdmin = url.pathname === "/admin" || url.pathname.startsWith("/admin/(protected)");

  if (!token && protectedMember) {
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }
  if (!token && protectedAdmin) {
    url.pathname = "/admin/signin";
    return NextResponse.redirect(url);
  }
  // Allow requests with a session cookie to proceed; server layout enforces ADMIN role

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/admin", "/admin/(protected)/:path*", "/signin", "/signup"],
};


