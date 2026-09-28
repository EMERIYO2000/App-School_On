import { createContext, useCallback, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const toastTones = {
  success: { icon: CheckCircle2, wrap: 'bg-neutral-950 text-white', iconColor: 'text-success' },
  error: { icon: XCircle, wrap: 'bg-neutral-950 text-white', iconColor: 'text-error' },
  warning: { icon: AlertTriangle, wrap: 'bg-neutral-950 text-white', iconColor: 'text-warning' },
  info: { icon: Info, wrap: 'bg-neutral-950 text-white', iconColor: 'text-info' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (tone, title, description, duration = 4000) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t, { id, tone, title, description }])
      if (duration > 0) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  const toast = {
    success: (title, desc) => push('success', title, desc),
    error: (title, desc) => push('error', title, desc),
    warning: (title, desc) => push('warning', title, desc),
    info: (title, desc) => push('info', title, desc),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 left-4 sm:left-auto z-[60] flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map((t) => {
            const cfg = toastTones[t.tone]
            const Icon = cfg.icon
            return (
              <div
                key={t.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 max-w-sm w-full sm:w-auto rounded-md px-4 py-3 shadow-2 animate-slide-up ${cfg.wrap}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${cfg.iconColor}`} aria-hidden />
                <div className="min-w-0 text-sm">
                  <p className="font-medium">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-white/80 text-xs break-words">{t.description}</p>}
                </div>
                <button onClick={() => dismiss(t.id)} className="shrink-0 text-white/60 hover:text-white" aria-label="Fermer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext) || toastFallback

const toastFallback = {
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
}