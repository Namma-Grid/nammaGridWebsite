'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RoleBadge from '@/app/components/shared/RoleBadge';

const NAV = [
  { href: '/citizen', label: 'Home', icon: '🏠' },
  { href: '/citizen/routes', label: 'Plan My Route', icon: '🗺️' },
  { href: '/citizen/forecast', label: 'Charging Forecast', icon: '📊' },
  { href: '/citizen/explore', label: 'Explore City', icon: '🏙️' },
];

export default function CitizenNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav shadow-sm' : 'bg-white/60 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/citizen" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
              🚗
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-none">
                <span className="text-slate-800">Namma</span>
                <span className="text-emerald-600">Grid</span>
              </span>
              <span className="text-[9px] text-emerald-500 font-semibold uppercase tracking-widest leading-none">EV Driver</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  pathname === item.href
                    ? 'text-emerald-700 bg-emerald-50 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: role badge */}
          <div className="hidden md:flex items-center gap-3">
            <RoleBadge role="citizen" />
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition-colors"
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

      {menuOpen && <div className="mobile-menu-overlay md:hidden" onClick={() => setMenuOpen(false)} />}
      {menuOpen && (
        <div className="mobile-menu-panel md:hidden">
          <div className="p-6 pt-8 space-y-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-base font-bold text-slate-800">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xl">×</button>
            </div>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === item.href ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 hover:bg-slate-50'}`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-100 mt-4">
              <RoleBadge role="citizen" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
