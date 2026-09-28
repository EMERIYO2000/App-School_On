import { useEffect, useRef, useState } from 'react'
import { Check, Globe, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../../i18n'

export default function LanguageSwitcher({ className = '', compact = false }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const current = i18n.resolvedLanguage || i18n.language

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center justify-center gap-2 rounded-md px-3 h-10 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors ${
          compact ? 'px-2.5' : ''
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Langue"
      >
        {compact ? <Languages className="w-5 h-5" /> : <Globe className="w-5 h-5" aria-hidden />}
        <span className="hidden sm:inline uppercase font-semibold">{current}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-lg bg-surface border border-line shadow-2 py-1.5 animate-fade-in origin-top-right z-50"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = current === lang.code
            return (
              <button
                key={lang.code}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  i18n.changeLanguage(lang.code)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-ink-2 hover:bg-surface-2 ${
                  active ? 'font-semibold text-brand-blue-dark' : ''
                }`}
              >
                <span>{lang.label}</span>
                {active && <Check className="w-4 h-4" aria-hidden />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}