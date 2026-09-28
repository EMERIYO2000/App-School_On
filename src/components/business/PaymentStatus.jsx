import { Badge } from '../ui'
import { PAYMENT_STATUS_LABELS } from '../../lib/constants'
import { formatDate, formatMoney } from '../../lib/format'

export default function PaymentStatus({ transaction, className = '' }) {
  const t = transaction || {}
  const status = String(t.status || '').toUpperCase()
  const method = t.payment_method || t.method
  const currency = t.currency || 'BIF'
  return (
    <div className={`bg-surface rounded-lg border border-line shadow-1 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-3">Transaction {t.transaction_id || t.id || ''}</p>
          <p className="mt-1.5 text-xl font-bold text-ink">{formatMoney(t.amount, currency)}</p>
        </div>
        <Badge tone={status === 'SUCCESS' || status === 'COMPLETED' ? 'success' : status === 'FAILED' ? 'error' : status === 'REFUNDED' ? 'neutral' : 'warning'}>
          {PAYMENT_STATUS_LABELS[status] || status || '—'}
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-3">
        <span className="font-medium text-ink-2">{t.payment_reason || (t.booking ? "Réservation d'un enseignant" : "Paiement d'un cours")}</span>
        {method && <span>{method}</span>}
        <span>{formatDate(t.created_at || t.date)}</span>
      </div>
    </div>
  )
}
