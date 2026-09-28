import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { authService } from '../../services/auth.service'
import { getError } from '../../services/api'
import { Button, Input, Alert } from '../../components/ui'

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    email: location.state?.email || '',
    code: '',
    new_password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await authService.confirmPasswordReset(form)
      setDone(true)
    } catch (err) {
      setError(getError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-10">
        <span className="inline-flex h-16 w-16 rounded-full bg-success-light text-success items-center justify-center mb-5">
          ✓
        </span>
        <h1 className="text-2xl font-bold text-ink">{t('reset.doneTitle')}</h1>
        <p className="mt-2 text-sm text-ink-3">{t('reset.doneSubtitle')}</p>
        <Button size="lg" className="mt-7" onClick={() => navigate('/login')}>
          {t('reset.goLogin')}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{t('reset.title')}</h1>
        <p className="mt-1 text-sm text-ink-3">
          {t('reset.subtitle')}
        </p>
      </div>
      {error && <Alert.Error className="mb-5">{error}</Alert.Error>}
      <form onSubmit={onSubmit} className="space-y-5">
        <Input label={t('reset.email')} type="email" value={form.email} onChange={set('email')} required placeholder="ex. aminata@example.com" />
        <Input
          label={t('reset.otp')}
          value={form.code}
          onChange={set('code')}
          required
          placeholder="123456"
          inputMode="numeric"
          hint={t('reset.otpHint')}
        />
        <Input label={t('reset.newPassword')} type="password" value={form.new_password} onChange={set('new_password')} required placeholder="••••••••" autoComplete="new-password" />
        <Button type="submit" fullWidth size="lg" loading={submitting} icon={ShieldCheck}>
          {t('reset.submit')}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-3">
        <Link to="/login" className="font-medium text-brand-blue hover:underline">
          {t('reset.back')}
        </Link>
      </p>
    </div>
  )
}