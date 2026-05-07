import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import ChatBot from "@/app/components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NammaGrid — EV Charging Intelligence for Bengaluru",
  description:
    "Spatio-temporal decision-support dashboard for EV charging demand prediction, route intelligence, and infrastructure planning across Bengaluru city.",
  keywords: [
    "EV charging",
    "Bengaluru",
    "BESCOM",
    "demand prediction",
    "infrastructure planning",
    "hexagonal grid",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full flex flex-col gradient-bg bg-grid-pattern">
        <Navbar />
        <main className="flex-1">{children}</main>
        <ChatBot />

        {/* Footer */}
        <footer className="border-t border-slate-100 py-8 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-xs">⚡</div>
              <span className="text-slate-800 font-bold text-sm">NammaGrid</span>
            </div>
            <p className="text-slate-400 text-xs">
              Spatio-Temporal Intelligence for Grid-Aware EV Infrastructure
            </p>
            <p className="text-slate-300 text-[11px] mt-2">
              Built for BESCOM × AI for Bharat Hackathon 2026
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
