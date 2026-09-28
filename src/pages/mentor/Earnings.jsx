import { useMemo } from 'react'
import { Wallet, TrendingUp, CreditCard } from 'lucide-react'
import { paymentsService } from '../../services/payments.service'
import { useFetch } from '../../hooks/useFetch'
import PaymentStatus from '../../components/business/PaymentStatus'
import { Card, EmptyState, ErrorState, PageLoader, StatCard } from '../../components/ui'
import { formatMoney } from '../../lib/format'

export default function MentorEarningsPage() {
  const txs = useFetch(() => paymentsService.getEarnings().then(normalize), [])
  const results = txs.data || []

  const stats = useMemo(() => {
    const paid = results.filter((t) => ['SUCCESS', 'COMPLETED', 'PAID', 'RELEASED'].includes(String(t.status || '').toUpperCase()))
    const pending = results.filter((t) => ['PENDING', 'PROCESSING', 'HELD', 'READY_TO_RELEASE'].includes(String(t.status || '').toUpperCase()))
    return {
      total: paid.reduce((s, t) => s + Number(t.amount || 0), 0),
      pending: pending.reduce((s, t) => s + Number(t.amount || 0), 0),
      count: paid.length,
    }
  }, [results])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mes gains</h1>
        <p className="mt-1 text-sm text-ink-3">Transactions liées à tes cours et à tes sessions de mentorat.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Gains disponibles" value={formatMoney(stats.total)} icon={Wallet} tone="success" />
        <StatCard label="En attente (séquestre)" value={formatMoney(stats.pending)} icon={CreditCard} tone="warning" />
        <StatCard label="Paiements reçus" value={stats.count} icon={TrendingUp} tone="blue" />
      </div>

      {txs.loading && <PageLoader />}
      {!txs.loading && txs.error && <ErrorState message={txs.error} onRetry={txs.refresh} />}
      {!txs.loading && !txs.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={Wallet}
            title="Aucune transaction pour l'instant"
            description="Tes revenus de sessions mentorat et de ventes de cours apparaîtront ici."
          />
        </Card>
      )}
      {!txs.loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((t) => (
            <PaymentStatus key={t.id ?? t.transaction_id} transaction={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function normalize(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}
