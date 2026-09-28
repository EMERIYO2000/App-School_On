import { useEffect, useState } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { registerSW } from 'virtual:pwa-register'

function CTAButton({ onClick, children, icon: Icon, primary = false }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 h-9 text-sm font-medium transition-colors ${
        primary
          ? 'bg-brand-blue text-white hover:bg-brand-blue-dark'
          : 'bg-surface-2 text-ink hover:bg-surface-3'
      }`}
    >
      <Icon className="w-4 h-4" aria-hidden />
      {children}
    </button>
  )
}

function Banner({ children, onDismiss }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-x-0 top-0 z-[60] p-3">
      <div className="mx-auto max-w-md flex items-start gap-3 rounded-2xl border border-line bg-surface shadow-3 p-4 animate-slide-up">
        <div className="flex-1 min-w-0 text-sm text-ink">{children}</div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
          aria-label={t('common.close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default function PwaSupport() {
  const { t } = useTranslation()
  const [installEvt, setInstallEvt] = useState(null)
  const [dismissedInstall, setDismissedInstall] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [dismissedRefresh, setDismissedRefresh] = useState(false)

  useEffect(() => {
    let updateSW = null

    const onBeforeInstall = (e) => {
      e.preventDefault()
      setInstallEvt(e)
    }
    const onInstalled = () => {
      setInstallEvt(null)
      setDismissedInstall(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true)
        setOfflineReady(false)
      },
      onOfflineReady() {
        setOfflineReady(true)
      },
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
      if (updateSW) updateSW = null
    }
  }, [])

  if (needRefresh && !dismissedRefresh) {
    return (
      <Banner onDismiss={() => setDismissedRefresh(true)}>
        <p className="font-semibold">{t('pwa.updateTitle')}</p>
        <p className="mt-0.5 text-ink-3">{t('pwa.updateBody')}</p>
        <div className="mt-3 flex gap-2">
          <CTAButton primary icon={RefreshCw} onClick={() => location.reload()}>
            {t('pwa.update')}
          </CTAButton>
        </div>
      </Banner>
    )
  }

  if (installEvt && !dismissedInstall && !window.matchMedia('(display-mode: standalone)').matches) {
    return (
      <Banner onDismiss={() => setDismissedInstall(true)}>
        <p className="font-semibold">{t('pwa.installTitle')}</p>
        <p className="mt-0.5 text-ink-3">{t('pwa.installBody')}</p>
        <div className="mt-3 flex gap-2">
          <CTAButton
            primary
            icon={Download}
            onClick={async () => {
              installEvt.prompt()
              const { outcome } = await installEvt.userChoice
              if (outcome === 'accepted') setDismissedInstall(true)
            }}
          >
            {t('pwa.install')}
          </CTAButton>
        </div>
      </Banner>
    )
  }

  if (offlineReady) {
    return (
      <Banner onDismiss={() => setOfflineReady(false)}>
        <p className="font-semibold">{t('pwa.offlineTitle')}</p>
        <p className="mt-0.5 text-ink-3">{t('pwa.offlineBody')}</p>
      </Banner>
    )
  }

  return null
}