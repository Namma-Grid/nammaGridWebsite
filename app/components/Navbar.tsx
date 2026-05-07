'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type LeafLink = { type?: 'link'; href: string; label: string; icon: string };
type DropdownLink = {
  type: 'dropdown';
  label: string;
  icon: string;
  items: { href: string; label: string; icon: string; description?: string }[];
};
type NavItem = LeafLink | DropdownLink;

const NAV_LINKS: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/hexgrid', label: 'Hex Grid', icon: '⬡' },
  { href: '/routes', label: 'EV Routes', icon: '⚡' },
  { href: '/demand', label: 'Demand Forecast', icon: '📊' },
  {
    type: 'dropdown',
    label: 'Planner',
    icon: '🧭',
    items: [
      {
        href: '/schedule',
        label: 'Scheduler',
        icon: '⏱️',
        description: 'LP optimizer + AI charging windows',
      },
      {
        href: '/infrastructure',
        label: 'Infra Planner',
        icon: '🏗️',
        description: 'ML-scored station siting + zones',
      },
    ],
  },
  { href: '/explore', label: '3D City', icon: '🏙️' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [openDropdown]);

  function isItemActive(item: NavItem): boolean {
    if (item.type === 'dropdown') return item.items.some((s) => pathname === s.href);
    return pathname === item.href;
  }

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
              <span className="text-slate-800">Namma</span>
              <span className="text-blue-600">Grid</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {NAV_LINKS.map((item) => {
              if (item.type === 'dropdown') {
                const active = isItemActive(item);
                const isOpen = openDropdown === item.label;
                return (
                  <div key={item.label} className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        active
                          ? 'text-blue-700 bg-blue-50 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                      aria-expanded={isOpen}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 glass-card-static p-2 z-50 animate-fade-in">
                        {item.items.map((sub) => {
                          const subActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                subActive
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                              }`}
                            >
                              <span className="text-lg shrink-0 mt-0.5">{sub.icon}</span>
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{sub.label}</div>
                                {sub.description && (
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    {sub.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    pathname === item.href
                      ? 'text-blue-700 bg-blue-50 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Status + Mobile hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-glow" />
              <span className="text-xs text-slate-400">Live</span>
            </div>

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

      {menuOpen && (
        <div className="mobile-menu-overlay md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {menuOpen && (
        <div className="mobile-menu-panel md:hidden">
          <div className="p-6 pt-8">
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold">
                <span className="text-slate-800">Namma</span>
                <span className="text-blue-600">Grid</span>
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-1">
              {NAV_LINKS.map((item) => {
                if (item.type === 'dropdown') {
                  return (
                    <div key={item.label} className="pt-2">
                      <div className="px-4 pb-1 text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                        <span>{item.icon}</span>
                        {item.label}
                      </div>
                      {item.items.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                            pathname === sub.href
                              ? 'text-blue-700 bg-blue-50'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-lg">{sub.icon}</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                      pathname === item.href
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
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
