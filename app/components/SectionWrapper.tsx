interface SectionWrapperProps {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  badge?: string;
}

export default function SectionWrapper({
  id,
  title,
  subtitle,
  icon,
  children,
  badge,
}: SectionWrapperProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="glass-card-static p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100 border border-blue-200/50 flex items-center justify-center text-xl sm:text-2xl shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h2 className="section-title">{title}</h2>
              <p className="section-subtitle mt-1 max-w-2xl">{subtitle}</p>
            </div>
          </div>
          {badge && (
            <span className="badge badge-blue shrink-0">{badge}</span>
          )}
        </div>

        {/* Divider */}
        <div className="glow-line mb-5 sm:mb-6" />

        {/* Content */}
        {children}
      </div>
    </section>
  );
}
