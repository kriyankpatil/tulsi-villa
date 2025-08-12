import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Image from "next/image";

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
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative overflow-x-hidden`}
      >
        {/* Floating decorative elements - hidden on small screens */}
        <div className="fixed inset-0 pointer-events-none z-0 hidden sm:block">
          <div className="absolute top-20 left-10 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl floating-element"></div>
          <div className="absolute top-40 right-20 w-12 h-12 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-xl floating-element"></div>
          <div className="absolute bottom-40 left-20 w-14 h-14 sm:w-28 sm:h-28 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl floating-element"></div>
          <div className="absolute bottom-20 right-10 w-10 h-10 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400/10 to-cyan-400/10 rounded-full blur-xl floating-element"></div>
        </div>

        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <a href="/member" className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <Image 
                    src="/images/tulsi-villa-logo.jpg" 
                    alt="Tulsi Villa Residency" 
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-xl sm:text-2xl lg:text-3xl text-slate-900">Tulsi Villa</span>
              </a>
              <Nav />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">{children}</main>
      </body>
    </html>
  );
}
