import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tulsi Villa",
  description: "Member and Admin apps for receipts and expenses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative overflow-x-hidden`}
      >
        {/* Floating decorative elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl floating-element"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-xl floating-element"></div>
          <div className="absolute bottom-40 left-20 w-28 h-28 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl floating-element"></div>
          <div className="absolute bottom-20 right-10 w-20 h-20 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-full blur-xl floating-element"></div>
        </div>

        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/member" className="flex items-center space-x-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/images/tulsi-villa-logo.jpg" 
                    alt="Tulsi Villa Residency" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-3xl text-slate-900">Tulsi Villa</span>
              </a>
              <Nav />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">{children}</main>
      </body>
    </html>
  );
}
