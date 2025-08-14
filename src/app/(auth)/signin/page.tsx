"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignInPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      let msg = "Sign in failed";
      try { msg = (JSON.parse(text)?.error as string) || msg; } catch {}
      setError(msg);
      return;
    }
    
    const meRes = await fetch("/api/auth/me");
    const meText = await meRes.text();
    const me = meText ? JSON.parse(meText) : null;
    
    // Security check: Prevent admin users from logging in through member signin
    if (me?.role === "ADMIN") {
      setError("Admin users must use the admin signin page");
      // Clear the session since admin shouldn't be here
      await fetch("/api/auth/signout", { method: "POST" });
      return;
    }
    
    // Only allow MEMBER role users to proceed
    if (me?.role === "MEMBER") {
      router.push("/member");
    } else {
      setError("Invalid user role. Please contact administrator.");
      await fetch("/api/auth/signout", { method: "POST" });
    }
  }

  return (
    <div className="flex items-center justify-center py-8 sm:py-12 lg:py-16 px-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200/60 p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-50"></div>
          <div className="relative z-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
                <Image 
                  src="/images/tulsi-villa-logo.jpg" 
                  alt="Tulsi Villa Residency" 
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome</h1>
              <p className="text-slate-600 text-sm sm:text-base">Sign in to your Tulsi Villa account</p>
            </div>
            
            <form onSubmit={submit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input 
                  id="name"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-500 text-sm sm:text-base" 
                  placeholder="Enter your name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input 
                  id="password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-slate-900 placeholder-slate-500 text-sm sm:text-base" 
                  placeholder="Enter your password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs sm:text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Sign in
              </button>
            </form>
            
            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-slate-600 text-sm sm:text-base">
                New member?{" "}
                <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                  Create an account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


