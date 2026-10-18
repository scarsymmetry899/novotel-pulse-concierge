import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Hotel, ShieldCheck, MessageSquare, Key, Sparkles } from "lucide-react";
import { BranchProvider } from "@/context/BranchContext";
import BranchSelector from "@/components/BranchSelector";

export const metadata: Metadata = {
  title: "Novotel Pulse Concierge | Accor Executive Leisure",
  description: "Ultra-responsive, zero-download guest mobile mini-app and cross-department operations command center.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Novotel Pulse",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#171E52",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F9FC] text-[#171E52] flex flex-col antialiased">
        <BranchProvider>
          {/* Top Global Quick Switcher Bar */}
          <header className="sticky top-0 z-50 bg-[#171E52] text-white border-b border-[#0F1155]/60 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-bold tracking-widest uppercase text-[#C5A880] flex items-center gap-1.5 font-brand">
                <Hotel className="w-3.5 h-3.5 text-[#C5A880]" />
                Novotel Pulse
              </span>

              {/* Dynamic Branch Customization Dropdown */}
              <BranchSelector />
            </div>
            
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link 
                href="/" 
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all font-medium flex items-center gap-1 clickable-card"
              >
                <Sparkles className="w-3 h-3 text-[#C5A880]" />
                Guest Mini-App
              </Link>
              <Link 
                href="/staff" 
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all font-medium flex items-center gap-1 clickable-card"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Staff Portal
              </Link>
              <Link 
                href="/whatsapp" 
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all font-medium flex items-center gap-1 clickable-card"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                WhatsApp
              </Link>
              <Link 
                href="/stay?token=magic_token_412_vip" 
                className="px-2.5 py-1 rounded-md bg-[#C5A880]/20 text-[#C5A880] hover:bg-[#C5A880]/30 transition-all font-medium flex items-center gap-1 hidden md:flex clickable-card"
              >
                <Key className="w-3 h-3" />
                Token Entry
              </Link>
            </nav>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </BranchProvider>
      </body>
    </html>
  );
}
