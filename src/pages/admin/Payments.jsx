import { CreditCard, CalendarCheck, ShieldCheck } from 'lucide-react'
import { useFetch } from '../../hooks/useFetch'
import { paymentsService } from '../../services/payments.service'
import { isNotFound } from '../../services/api'
import { Badge, Card, EmptyState, ErrorState, PageLoader, statusTone } from '../../components/ui'
import PaymentStatus from '../../components/business/PaymentStatus'
import { formatMoney } from '../../lib/format'

export default function AdminPaymentsPage({ tab = 'payments' }) {
  if (tab === 'bookings') return <BookingsTab />
  if (tab === 'moderation') return <ModerationTab />
  return <PaymentsTab />
}

function PaymentsTab() {
  const txs = useFetch(async () => {
    const data = await paymentsService.getTransactions({ page_size: 100 })
    return Array.isArray(data) ? data : data.results || []
  }, [])
  const list = txs.data || []

  if (txs.loading) return <PageLoader label="Chargement des paiements…" />
  if (txs.error && !isNotFound(txs.error))
    return <ErrorState message={txs.error} onRetry={txs.refresh} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Paiements</h1>
        <p className="mt-1 text-sm text-ink-3">Transactions, remboursements et relevés de la plateforme.</p>
      </div>
      {isNotFound(txs.error) ? (
        <EmptyState icon={CreditCard} title="Transactions indisponibles" description="L'endpoint admin des paiements n'est pas encore exposé." />
      ) : list.length === 0 ? (
        <EmptyState icon={CreditCard} title="Aucune transaction" description="Les paiements apparaîtront ici une fois initiés." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((t) => (
            <PaymentStatus key={t.id ?? t.transaction_id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function BookingsTab() {
  const bookings = useFetch(async () => {
    const data = await paymentsService.getBookings({ page_size: 100 })
    return Array.isArray(data) ? data : data.results || []
  }, [])
  const list = bookings.data || []

  if (bookings.loading) return <PageLoader label="Chargement des sessions…" />
  if (bookings.error && !isNotFound(bookings.error))
    return <ErrorState message={bookings.error} onRetry={bookings.refresh} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Sessions mentorat</h1>
        <p className="mt-1 text-sm text-ink-3">Suivi des réservations entre apprenants et mentors.</p>
      </div>
      {isNotFound(bookings.error) ? (
        <EmptyState icon={CalendarCheck} title="Sessions indisponibles" description="L'endpoint admin des sessions n'est pas encore exposé." />
      ) : list.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Aucune session" description="Les réservations apparaîtront ici." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-line">
            {list.map((b) => (
              <li key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{b.subject || 'Session de mentorat'}</p>
                  <p className="text-xs text-ink-3">
                    {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString('fr-FR') : 'Date à définir'} · {formatMoney(b.amount || 0)}
                  </p>
                </div>
                <Badge tone={statusTone(b.status)}>{b.status || 'PENDING'}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function ModerationTab() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Modération</h1>
        <p className="mt-1 text-sm text-ink-3">Contenus signalés, avis et demandes en attente.</p>
      </div>
      <EmptyState
        icon={ShieldCheck}
        title="File de modération vide"
        description="Les contenus et comptes signalés à examiner apparaîtront ici."
      />
    </div>
  )
}
