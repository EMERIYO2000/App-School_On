import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock, CreditCard } from 'lucide-react'
import { Alert, Avatar, Button, StatusBadge } from '../ui'
import { BOOKING_STATUS_LABELS } from '../../lib/constants'
import { formatDateTime, getAvatar, getFullName } from '../../lib/format'
import { paymentsService } from '../../services/payments.service'
import { getError } from '../../services/api'

export default function BookingCard({ booking, onConfirm, isMentor = false, className = '' }) {
  const b = booking || {}
  const other = isMentor ? (b.student || { full_name: b.student_name }) : (b.mentor_profile || { full_name: b.mentor_name })
  const sessionAt = b.scheduled_at || [b.date_requested, b.time_requested].filter(Boolean).join('T')
  const [payment, setPayment] = useState(b.payment || null)
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bitcoin')
  const [bitliberaPhone, setBitliberaPhone] = useState('')
  const [bitliberaOtp, setBitliberaOtp] = useState('')
  const [bitliberaOtpSent, setBitliberaOtpSent] = useState(false)

  useEffect(() => setPayment(b.payment || null), [b.payment])

  useEffect(() => {
    if (payment?.status !== 'PENDING' || !payment.transaction_id) return undefined
    let timer
    let cancelled = false
    const refresh = async () => {
      try {
        const updated = await paymentsService.getTransaction(payment.transaction_id)
        if (cancelled) return
        setPayment({ ...payment, ...updated, payment_request: updated.provider_payment_request || payment.payment_request })
        if (updated.status === 'PENDING') timer = setTimeout(refresh, 7000)
      } catch {
        if (!cancelled) timer = setTimeout(refresh, 12000)
      }
    }
    timer = setTimeout(refresh, 5000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [payment?.status, payment?.transaction_id, payment?.payment_request])

  async function startPayment() {
    setPaying(true)
    setPaymentError('')
    try {
      if (paymentMethod === 'bitlibera' && !bitliberaOtpSent) {
        await paymentsService.requestBitliberaOtp({
          phone: bitliberaPhone,
          amount: Number(b.price || 0),
        })
        setBitliberaOtpSent(true)
        return
      }
      const result = await paymentsService.createTransaction({
        booking_id: Number(b.id),
        payment_method: paymentMethod,
        idempotency_key: `booking-${b.id}-${payment?.status === 'FAILED' ? Date.now() : 'initial'}`,
        ...(paymentMethod === 'bitlibera' ? {
          bitlibera_phone: bitliberaPhone,
          bitlibera_otp: bitliberaOtp,
        } : {}),
      })
      setPayment({ ...result, payment_request: result.provider_payment_request })
    } catch (error) {
      setPaymentError(getError(error))
    } finally {
      setPaying(false)
    }
  }
  return (
    <div className={`bg-surface rounded-lg border border-line shadow-1 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={getAvatar(other)} alt={getFullName(other)} size="md" />
          <div className="min-w-0">
            <p className="font-medium text-ink truncate">{getFullName(other)}</p>
            <p className="text-xs text-ink-3 truncate">{b.subject || b.course_title || 'Session de mentorat'}</p>
          </div>
        </div>
        <StatusBadge status={b.status} labels={BOOKING_STATUS_LABELS} />
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-ink-3" /> {formatDateTime(sessionAt || b.datetime || b.date)}
        </span>
        {b.duration && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-ink-3" /> {b.duration} min
          </span>
        )}
        {b.price != null && (
          <span className="font-medium text-ink">{Number(b.price).toLocaleString('fr-FR')} BIF</span>
        )}
      </div>
      {(b.notes || b.message || b.topic) && (
        <p className="mt-3 text-sm text-ink-3 bg-body rounded-md px-3 py-2 line-clamp-2">
          {b.notes || b.message || b.topic}
        </p>
      )}
      {onConfirm && ['PENDING', 'PENDING_PAYMENT'].includes(String(b.status || '').toUpperCase()) && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" icon={CheckCircle2} onClick={onConfirm}>
            {isMentor ? 'Accepter' : 'Confirmer ma présence'}
          </Button>
        </div>
      )}
      {!isMentor && payment?.status === 'PAID' && (
        <p className="mt-4 text-sm font-medium text-success">Paiement confirmé · {payment.amount} {payment.currency || 'BIF'}</p>
      )}
      {!isMentor && !['PAID', 'COMPLETED'].includes(String(payment?.status || '').toUpperCase()) && (
        <div className="mt-4 space-y-3">
          {paymentError && <Alert.Error>{paymentError}</Alert.Error>}
          {!payment?.payment_request && (
            <>
              <label className="block text-sm text-ink-2">
                Méthode de paiement
                <select value={paymentMethod} onChange={(e) => {
                  setPaymentMethod(e.target.value)
                  setBitliberaOtpSent(false)
                  setBitliberaOtp('')
                }} className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink">
                  <option value="bitcoin">Bitcoin via Blink (SAT)</option>
                  <option value="bitlibera">Bitlibera (BIF)</option>
                </select>
              </label>
              {paymentMethod === 'bitlibera' && (
                <>
                  <input value={bitliberaPhone} onChange={(e) => setBitliberaPhone(e.target.value)} placeholder="Téléphone Bitlibera (+257...)" className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink" />
                  {bitliberaOtpSent && <input value={bitliberaOtp} onChange={(e) => setBitliberaOtp(e.target.value)} placeholder="Code OTP" inputMode="numeric" className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink" />}
                </>
              )}
            </>
          )}
          {payment?.payment_request ? (
            <div className="rounded-md border border-line bg-body p-3 space-y-2">
              <p className="text-sm font-medium">Invoice Lightning · {payment.amount} {payment.currency || 'BIF'}</p>
              <textarea aria-label="Invoice Lightning de la session" readOnly value={payment.payment_request} className="w-full min-h-20 rounded border border-line bg-surface p-2 text-xs break-all" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(payment.payment_request)}>Copier l'invoice</Button>
                <span className="self-center text-xs text-ink-3">Statut : {payment.status}</span>
              </div>
            </div>
          ) : (
            ['PENDING', 'ACCEPTED', 'PENDING_PAYMENT'].includes(String(b.status || '').toUpperCase()) ? (
              <Button size="sm" icon={CreditCard} loading={paying} onClick={startPayment}>
                {paymentMethod === 'bitlibera' && !bitliberaOtpSent ? 'Recevoir le code OTP' : 'Payer la session'}
              </Button>
            ) : <p className="text-xs text-ink-3">Le paiement sera disponible après acceptation de la demande par le mentor.</p>
          )}
        </div>
      )}
    </div>
  )
}
