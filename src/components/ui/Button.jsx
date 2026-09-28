import { Loader2 } from 'lucide-react'

const variants = {
  primary:
    'bg-brand-blue text-white shadow-1 hover:bg-brand-blue-dark focus-visible:ring-brand-blue',
  secondary:
    'bg-brand-blue-light text-brand-blue-dark hover:bg-blue-200 focus-visible:ring-brand-blue',
  outline:
    'border border-line bg-surface text-ink-2 hover:bg-surface-2 hover:border-line focus-visible:ring-neutral-400',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink focus-visible:ring-neutral-400',
  destructive:
    'bg-error text-white hover:bg-red-700 focus-visible:ring-error',
  link: 'text-brand-blue underline-offset-4 hover:underline focus-visible:ring-brand-blue',
  terracotta:
    'bg-brand-terracotta text-white shadow-1 hover:bg-brand-terracotta-dark focus-visible:ring-brand-terracotta',
}

const sizes = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon: Icon,
  children,
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden />
      )}
      {children}
    </button>
  )
}