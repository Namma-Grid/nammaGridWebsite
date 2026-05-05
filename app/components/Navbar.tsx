'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/hexgrid', label: 'Hex Grid', icon: '⬡' },
  { href: '/routes', label: 'EV Routes', icon: '⚡' },
  { href: '/demand', label: 'Demand Forecast', icon: '📊' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav shadow-sm' : 'bg-white/60 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow">
              ⚡
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-slate-800">Volt</span>
              <span className="text-blue-600">Route</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  pathname === link.href
                    ? 'text-blue-700 bg-blue-50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Status + Mobile hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-xs text-slate-400">Live</span>
            </div>

            {/* Hamburger button (mobile only) */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2 -mr-2 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger-line ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`hamburger-line ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="mobile-menu-overlay md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="mobile-menu-panel md:hidden">
          <div className="p-6 pt-8">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold">
                <span className="text-slate-800">Volt</span>
                <span className="text-blue-600">Route</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    pathname === link.href
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
                <span className="text-sm text-slate-400">Live Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
