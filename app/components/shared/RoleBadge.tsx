'use client';

import { useRouter } from 'next/navigation';

export default function RoleBadge({ role }: { role: 'operator' | 'citizen' }) {
  const router = useRouter();

  function switchRole() {
    localStorage.removeItem('namma_role');
    router.push('/');
  }

  const isOp = role === 'operator';

  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
        isOp
          ? 'bg-blue-50 text-blue-700 border border-blue-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}>
        {isOp ? '🔒 BESCOM Operator' : '🚗 EV Driver'}
      </span>
      <button
        onClick={switchRole}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
      >
        Switch
      </button>
    </div>
  );
}
