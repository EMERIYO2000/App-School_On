import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Button from './Button'

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', hideClose = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && onClose) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Fenêtre'}
        className={`relative w-full ${sizes[size]} bg-surface rounded-t-2xl sm:rounded-lg shadow-3 animate-slide-up max-h-[92vh] flex flex-col`}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-line">
            <div className="min-w-0">
              {title && <h2 className="text-lg font-semibold text-ink truncate">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p>}
            </div>
            {!hideClose && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirmer', message, confirmLabel = 'Confirmer', variant = 'destructive', loading, extra }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-ink-2">{message}</p>
      {extra}
    </Modal>
  )
}