import OperatorNavbar from '@/app/components/operator/OperatorNavbar';
import RoleGuard from '@/app/components/shared/RoleGuard';
import ChatBot from '@/app/components/ChatBot';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard required="operator">
      <div className="operator-shell bg-grid-pattern gradient-bg">
        <div className="mobile-only-banner">
          ⚠️ For best experience, use a tablet or desktop
        </div>
        <OperatorNavbar />
        <main className="flex-1">{children}</main>
        <ChatBot />
        <footer className="border-t border-slate-100 py-6 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs">⚡</div>
              <span className="text-slate-700 font-bold text-sm">NammaGrid Operator</span>
            </div>
            <p className="text-slate-400 text-xs">BESCOM × AI for Bharat Hackathon 2026 · Built on: H3 (Uber) · GradientBoosting · LP Optimization · Leaflet · Three.js · Restricted Access</p>
            <a href="/about" className="text-xs text-blue-500 hover:underline">Impact & Business Case →</a>
          </div>
        </footer>
      </div>
    </RoleGuard>
  );
}
