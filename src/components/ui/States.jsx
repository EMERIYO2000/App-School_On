import { AlertTriangle, CheckCircle2, Info, SearchX, WifiOff, XCircle, Loader2, Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Button from './Button'

export function Spinner({ className = 'w-5 h-5 text-brand-blue', label }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-3" role="status">
      <Loader2 className={`animate-spin ${className}`} aria-hidden />
      {label && <span>{label}</span>}
    </span>
  )
}

export function PageLoader({ label }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24" role="status">
      <Spinner className="w-8 h-8 text-brand-blue" />
      <p className="text-sm text-ink-3">{label || t('common.loading')}</p>
    </div>
  )
}

export function Skeleton({ className = '', lines = 3 }) {
  if (lines > 1) {
    return (
      <div className={`space-y-3 ${className}`} aria-hidden>
        <div className="relative overflow-hidden rounded-lg bg-surface-2 after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent h-4 w-3/4" />
        <div className="relative overflow-hidden rounded-lg bg-surface-2 after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent h-4 w-full" />
        <div className="relative overflow-hidden rounded-lg bg-surface-2 after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent h-4 w-1/2" />
      </div>
    )
  }
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-surface-2 after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent ${className}`}
      aria-hidden
    />
  )
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-surface rounded-lg border border-line shadow-1 p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-4/5" />
    </div>
  )
}

export function GridSkeleton({ count = 6, Card = CardSkeleton }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} />
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action, icon: Icon = Inbox, className = '' }) {
  const { t } = useTranslation()
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <span className="h-14 w-14 rounded-full bg-surface-2 flex items-center justify-center text-ink-3 mb-4">
        <Icon className="w-7 h-7" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-ink">{title || t('common.states.emptyTitle')}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry, title, icon: Icon = XCircle }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6" role="alert">
      <span className="h-14 w-14 rounded-full bg-error-light text-error flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-ink">{title || t('common.states.errorTitle')}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-2 break-words">{message || t('common.states.errorMessage')}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  )
}

export function NotFoundState({ message, onBack }) {
  const { t } = useTranslation()
  return <ErrorState title={t('common.states.notFoundTitle')} message={message || t('common.states.notFoundMessage')} icon={SearchX} onRetry={onBack} />
}

export async function offlineFallback(error, context = '') {
  console.warn(`${context} API indisponible :`, error?.message)
  return { unavailable: true, error, context }
}

function AlertRow({ tone, icon: Icon, title, children, onClose }) {
  const { t } = useTranslation()
  const tones = {
    success: 'bg-success-light text-success border-success/30',
    warning: 'bg-warning-light text-warning border-warning/30',
    error: 'bg-error-light text-error border-error/30',
    info: 'bg-info-light text-info border-info/30',
  }
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md border px-4 py-3 text-sm flex items-start gap-2.5 ${tones[tone]}`}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-70 hover:opacity-100" aria-label={t('common.close')}>
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export const Alert = {
  Success: (p) => <AlertRow tone="success" icon={CheckCircle2} {...p} />,
  Warning: (p) => <AlertRow tone="warning" icon={AlertTriangle} {...p} />,
  Error: (p) => <AlertRow tone="error" icon={XCircle} {...p} />,
  Info: (p) => <AlertRow tone="info" icon={Info} {...p} />,
}

export function OfflineNotice({ label }) {
  const { t } = useTranslation()
  return (
    <Alert.Info title={t('common.states.offlineTitle')}>
      {label || (
        <span>
          {t('common.states.offlineBody')}
        </span>
      )}
    </Alert.Info>
  )
}

export function ProgressBar({ value = 0, tone = 'blue', className = '', size = 'md' }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))
  const tones = {
    blue: 'bg-brand-blue',
    terracotta: 'bg-brand-terracotta',
    success: 'bg-success',
    warning: 'bg-warning',
  }
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full rounded-full bg-surface-2 overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${tones[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}