"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Nav() {
  const pathname = usePathname() || "";
  const isAdminSignin = pathname.startsWith("/admin/signin");
  const hideAdmin = pathname.startsWith("/signin") || pathname.startsWith("/signup") || isAdminSignin;
  const [me, setMe] = useState<null | { id: number; role: string }>(null);

  useEffect(() => {
    let aborted = false;
    fetch("/api/auth/me").then((r) => r.json()).then((u) => {
      if (!aborted) setMe(u);
    }).catch(() => {});
    return () => {
      aborted = true;
    };
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  }

  if (isAdminSignin) {
    return <nav className="flex gap-2 sm:gap-3 text-xs sm:text-sm items-center" />;
  }

  return (
    <nav className="flex gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm items-center">
      {me ? (
        <button 
          onClick={signOut} 
          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm"
        >
          Sign out
        </button>
      ) : (
        <>
          <Link 
            href="/signin" 
            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 font-medium text-xs sm:text-sm"
          >
            Sign in
          </Link>
          <Link 
            href="/signup" 
            className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs sm:text-sm"
          >
            Sign up
          </Link>
          {!hideAdmin && (
            <Link 
              href="/admin/signin" 
              className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-xs sm:text-sm"
            >
              Admin
            </Link>
          )}
        </>
      )}
    </nav>
  );
}


