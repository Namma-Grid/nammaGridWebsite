import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoltRoute — EV Charging Intelligence for Bengaluru",
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

        {/* Footer */}
        <footer className="border-t border-black/[0.06] py-6 px-6 text-center">
          <p className="text-slate-500 text-sm">
            <span className="text-slate-800 font-semibold">VoltRoute</span> — Spatio-Temporal Intelligence for Grid-Aware EV Infrastructure
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Built for BESCOM × AI for Bharat Hackathon 2026
          </p>
        </footer>
      </body>
    </html>
  );
}
