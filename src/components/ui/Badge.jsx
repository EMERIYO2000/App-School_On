import { useEffect, useState } from 'react'

const toneMap = {
  success: 'bg-success-light text-success border-success/30',
  warning: 'bg-warning-light text-warning border-warning/30',
  error: 'bg-error-light text-error border-error/30',
  info: 'bg-info-light text-info border-info/30',
  blue: 'bg-brand-blue-light text-brand-blue-dark border-brand-blue/20',
  terracotta: 'bg-brand-terracotta-light text-brand-terracotta-dark border-brand-terracotta/25',
  neutral: 'bg-surface-2 text-ink-2 border-line',
  dark: 'bg-neutral-950 text-white border-neutral-950',
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium border ${toneMap[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export const statusTone = (status = '') => {
  const s = String(status || '').toUpperCase()
  if (['SUCCESS', 'PAID', 'COMPLETED', 'VERIFIED', 'ACTIVE', 'PUBLISHED', 'RELEASED', 'CERTIFIED', 'ELIGIBLE'].includes(s)) return 'success'
  if (['FAILED', 'REJECTED', 'SUSPENDED', 'CANCELLED', 'REFUNDED', 'DISPUTED', 'ERROR', 'REVOKED'].includes(s)) return 'error'
  if (['PENDING', 'PROCESSING', 'HELD', 'UNDER_REVIEW', 'PENDING_VERIFICATION', 'NEEDS_INFORMATION', 'SUBMITTED', 'REVIEW', 'IN_PROGRESS', 'DRAFT', 'NOT_STARTED'].includes(s)) return 'warning'
  return 'neutral'
}

export function StatusBadge({ status, labels, className }) {
  return (
    <Badge tone={statusTone(status)} className={className}>
      {labels?.[String(status ?? '').toUpperCase()] || status || '—'}
    </Badge>
  )
}

export function Avatar({ src, alt = '', size = 'md', className = '', fallback, status }) {
  const [imageFailed, setImageFailed] = useState(false)
  useEffect(() => setImageFailed(false), [src])
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  }
  const fallbackText = fallback || (alt ? alt.slice(0, 1).toUpperCase() : '?')
  return (
    <span className="relative inline-flex shrink-0">
      {src && !imageFailed && (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover bg-surface-2 ${className}`}
          onError={() => setImageFailed(true)}
        />
      )}
      {(!src || imageFailed) && (
        <span
          className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold bg-brand-blue-light text-brand-blue-dark ${className}`}
        >
          {fallbackText}
        </span>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
            status === 'online' ? 'bg-success' : status === 'busy' ? 'bg-warning' : 'bg-neutral-400'
          }`}
        />
      )}
    </span>
  )
}
