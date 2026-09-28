import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme()
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 h-10 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors ${className}`}
      aria-label={isDark ? t('theme.enableLight') : t('theme.enableDark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      <span className="hidden sm:inline">{isDark ? t('theme.light') : t('theme.dark')}</span>
    </button>
  )
}