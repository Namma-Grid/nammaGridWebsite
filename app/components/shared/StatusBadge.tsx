export default function StatusBadge({ fromFallback }: { fromFallback: boolean }) {
  if (!fromFallback) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
      📡 Using cached data
    </span>
  );
}
