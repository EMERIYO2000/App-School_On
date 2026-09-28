import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ThemeToggle from '../components/ui/ThemeToggle'
import LanguageSwitcher from '../components/ui/LanguageSwitcher'

export default function PublicLayout() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="SCHOOL ON" className="w-9 h-9" />
            <span className="text-lg font-bold tracking-tight text-ink">
              SCHOOL <span className="text-brand-terracotta">ON</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-2">
            <Link to="/" className="hover:text-brand-blue">{t('header.home')}</Link>
            <Link to="/courses" className="hover:text-brand-blue">{t('header.courses')}</Link>
            <Link to="/mentors" className="hover:text-brand-blue">{t('header.mentors')}</Link>
            <Link to="/community" className="hover:text-brand-blue">{t('header.community')}</Link>
            <Link to="/verify" className="hover:text-brand-blue">{t('header.verify')}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            <LanguageSwitcher />
            <Link to="/login" className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium text-ink-2 hover:bg-surface-2">
              {t('header.login')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue-dark"
            >
              {t('header.register')}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-line bg-body">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="SCHOOL ON" className="w-8 h-8" />
            <span className="text-base font-bold text-ink">
              SCHOOL <span className="text-brand-terracotta">ON</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-ink-3 max-w-sm">
            {t('footer.tagline')}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{t('footer.platform')}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><Link to="/courses" className="hover:text-brand-blue">{t('header.courses')}</Link></li>
            <li><Link to="/mentors" className="hover:text-brand-blue">{t('header.mentors')}</Link></li>
            <li><Link to="/community" className="hover:text-brand-blue">{t('header.community')}</Link></li>
            <li><Link to="/quiz" className="hover:text-brand-blue">{t('footer.quiz')}</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{t('footer.info')}</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><Link to="/about" className="hover:text-brand-blue">{t('footer.about')}</Link></li>
            <li><Link to="/privacy" className="hover:text-brand-blue">{t('footer.privacy')}</Link></li>
            <li><Link to="/terms" className="hover:text-brand-blue">{t('footer.terms')}</Link></li>
            <li><Link to="/verify" className="hover:text-brand-blue">{t('header.verify')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-3">
        {t('footer.rights', { year: new Date().getFullYear() })}
      </div>
    </footer>
  )
}