export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`bg-surface rounded-lg border border-line shadow-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-3 px-5 pt-5 ${className}`}>
      <div>
        {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardBody({ className = '', children }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}

export function StatCard({ label, value, icon: Icon, tone = 'blue', hint, onClick }) {
  const tones = {
    blue: 'bg-brand-blue-light text-brand-blue-dark',
    terracotta: 'bg-brand-terracotta-light text-brand-terracotta-dark',
    neutral: 'bg-surface-2 text-ink-2',
    success: 'bg-success-light text-success',
  }
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className="bg-surface rounded-lg border border-line shadow-1 p-5 text-left w-full hover:border-line transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-3">{label}</p>
          <p className="mt-1 text-2xl font-bold text-ink truncate">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-3 line-clamp-2">{hint}</p>}
        </div>
        {Icon && (
          <span className={`h-10 w-10 shrink-0 rounded-md flex items-center justify-center ${tones[tone]}`}>
            <Icon className="w-5 h-5" aria-hidden />
          </span>
        )}
      </div>
    </Comp>
  )
}