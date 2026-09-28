import { useId, forwardRef } from 'react'
import { AlertCircle, Check } from 'lucide-react'

const baseField =
  'w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors disabled:bg-surface-2 disabled:text-ink-3'

const stateClass = (error) =>
  error ? 'border-error focus:ring-error' : 'border-line focus:ring-brand-blue hover:border-line'

export const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', id, trailing, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={fieldId}>
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          className={`${baseField} ${trailing ? 'pr-12' : ''} ${stateClass(error)} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{trailing}</div>}
      </div>
    </FieldShell>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, className = '', id, rows = 4, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={fieldId}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        className={`${baseField} resize-y ${stateClass(error)} ${className}`}
        {...props}
      />
    </FieldShell>
  )
})

export const Select = forwardRef(function Select(
  { label, error, hint, required, className = '', id, children, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} id={fieldId}>
      <select
        ref={ref}
        id={fieldId}
        className={`${baseField} appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem] pr-9 ${stateClass(error)} ${className}`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  )
})

export const Checkbox = forwardRef(function Checkbox(
  { label, error, hint, required, className = '', id, ...props },
  ref
) {
  const autoId = useId()
  const fieldId = id || autoId
  return (
    <div className={className}>
      <label htmlFor={fieldId} className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded-lg border-line text-brand-blue focus:ring-brand-blue accent-brand-blue"
          {...props}
        />
        <span className="text-sm text-ink-2">
          {label}
          {required && <span className="text-error"> *</span>}
        </span>
      </label>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-error" role="alert">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {!error && hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  )
})

export function FieldShell({ label, error, hint, required, id, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink-2">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-error" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  )
}

export function SuccessHint({ children }) {
  return (
    <p className="flex items-center gap-1 text-xs text-success" role="status">
      <Check className="w-3.5 h-3.5 shrink-0" /> {children}
    </p>
  )
}