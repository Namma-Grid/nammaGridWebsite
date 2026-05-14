import CitizenNavbar from '@/app/components/citizen/CitizenNavbar';
import RoleGuard from '@/app/components/shared/RoleGuard';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard required="citizen">
      <div className="citizen-shell bg-grid-pattern gradient-bg">
        <CitizenNavbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-100 py-6 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs">🚗</div>
              <span className="text-slate-700 font-bold text-sm">NammaGrid for EV Drivers</span>
            </div>
            <p className="text-slate-400 text-xs">BESCOM × AI for Bharat Hackathon 2026</p>
            <a href="/about" className="text-xs text-emerald-600 hover:underline">Impact & Business Case →</a>
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}
