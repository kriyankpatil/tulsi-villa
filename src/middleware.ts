import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("tv_session")?.value;
  const url = req.nextUrl.clone();

  const protectedMember = url.pathname.startsWith("/member");
  const protectedAdmin = url.pathname === "/admin" || url.pathname.startsWith("/admin/(protected)");
  const authPages = url.pathname === "/signin" || url.pathname === "/signup";
  const adminAuthPages = url.pathname === "/admin/signin" || url.pathname === "/admin/signup";

  // If user is already logged in and tries to access auth pages, redirect appropriately
  if (token && (authPages || adminAuthPages)) {
    // Check if it's an admin trying to access member auth pages
    if (token && authPages) {
      // We'll let the API handle role validation for security
      return NextResponse.next();
    }
    // For admin auth pages, let them proceed (might be re-authenticating)
    return NextResponse.next();
  }

  // Protect member routes
  if (!token && protectedMember) {
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (!token && protectedAdmin) {
    url.pathname = "/admin/signin";
    return NextResponse.redirect(url);
  }

  // Allow requests with a session cookie to proceed; server-side validation enforces roles
  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/admin", "/admin/(protected)/:path*", "/signin", "/signup", "/admin/signin", "/admin/signup"],
};


