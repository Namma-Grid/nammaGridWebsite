interface Props {
  lines?: number;
  height?: string;
  className?: string;
}

export default function SkeletonCard({ lines = 3, height, className = '' }: Props) {
  return (
    <div className={`glass-card-static p-4 sm:p-5 ${className}`} style={height ? { minHeight: height } : {}}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 rounded-full w-2/3" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div key={i} className={`h-3 bg-slate-100 rounded-full ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}
