import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookOpen, MessagesSquare, PenLine, Users } from 'lucide-react'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

function JourneyChip({ icon: Icon, label, tone }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 backdrop-blur px-3 py-1.5 text-sm">
      <Icon className="w-4 h-4" aria-hidden />
      {label}
    </span>
  )
}

export default function AuthLayout({ title, subtitle }) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-body flex">
      <div className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue flex-col justify-between p-12 text-white">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-full.png" alt="SCHOOL ON" className="h-11 w-auto" />
          </Link>
          <LanguageSwitcher
            className="[&>button]:text-white [&>button]:hover:bg-white/15"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
            {t('authLayout.claim')}
          </h1>
          <p className="text-white/85 max-w-md">
            {t('authLayout.subtitle')}
          </p>
          <div className="flex flex-wrap gap-2">
            <JourneyChip icon={BookOpen} label={t('authLayout.learn')} tone="blue" />
            <JourneyChip icon={PenLine} label={t('authLayout.train')} tone="terracotta" />
            <JourneyChip icon={Users} label={t('authLayout.mentors')} tone="blue" />
            <JourneyChip icon={MessagesSquare} label={t('authLayout.community')} tone="terracotta" />
          </div>
        </div>
        <p className="text-white/70 text-sm">{t('authLayout.copyright', { year: new Date().getFullYear() })}</p>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="lg:hidden flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="SCHOOL ON" className="w-9 h-9" />
            <span className="text-lg font-bold text-ink">
              SCHOOL <span className="text-brand-terracotta">ON</span>
            </span>
          </Link>
          <LanguageSwitcher compact />
        </div>
        <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
          <div className="w-full max-w-md animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink mb-6 lg:hidden">
              ← {t('common.back')}
            </Link>
            {(title || subtitle) && (
              <div className="mb-8">
                {title && <h1 className="text-2xl font-bold text-ink">{title}</h1>}
                {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}