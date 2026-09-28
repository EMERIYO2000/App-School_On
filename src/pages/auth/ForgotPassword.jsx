import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KeyRound } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { getError } from '../../services/api'
import { Button, Input, Alert } from '../../components/ui'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await authService.requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setError(getError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-10">
        <span className="inline-flex h-16 w-16 rounded-full bg-brand-blue-light text-brand-blue items-center justify-center mb-5">
          <KeyRound className="w-8 h-8" />
        </span>
        <h1 className="text-2xl font-bold text-ink">{t('forgot.sentTitle')}</h1>
        <p className="mt-2 text-sm text-ink-3 max-w-sm mx-auto">
          {t('forgot.sentSubtitle', { email })}
        </p>
        <div className="mt-7 flex flex-col gap-3 items-center">
          <Button size="lg" onClick={() => navigate('/reset-password', { state: { email } })}>
            {t('forgot.resetNow')}
          </Button>
          <button onClick={() => setSent(false)} className="text-sm text-brand-blue hover:underline">
            {t('forgot.editEmail')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{t('forgot.title')}</h1>
        <p className="mt-1 text-sm text-ink-3">
          {t('forgot.subtitle')}
        </p>
      </div>
      {error && <Alert.Error className="mb-5">{error}</Alert.Error>}
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label={t('forgot.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex. aminata@example.com"
          required
        />
        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {t('forgot.submit')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-3">
        <Link to="/login" className="font-medium text-brand-blue hover:underline">
          {t('forgot.back')}
        </Link>
      </p>
    </div>
  )
}