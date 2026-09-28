import { useMemo } from 'react'
import { CalendarCheck } from 'lucide-react'
import { paymentsService } from '../../services/payments.service'
import { useFetch } from '../../hooks/useFetch'
import BookingCard from '../../components/business/BookingCard'
import { Card, EmptyState, ErrorState, PageLoader, Tabs } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { getError } from '../../services/api'

export default function MentorBookingsPage() {
  const toast = useToast?.()
  const bookings = useFetch(() => paymentsService.getBookings().then(normalize), [])

  async function confirm(id) {
    try {
      await paymentsService.mentorConfirm(id)
      toast?.success?.('Session confirmée', 'L’apprenant sera notifié.')
      bookings.refresh()
    } catch (e) {
      toast?.error?.('Action impossible', getError(e))
    }
  }

  const results = bookings.data || []
  const tabs = useMemo(() => {
    const pending = results.filter((b) => ['PENDING', 'PENDING_PAYMENT'].includes(String(b.status || '').toUpperCase()))
    const active = results.filter((b) => ['ACCEPTED', 'PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(String(b.status || '').toUpperCase()))
    const done = results.filter((b) => ['COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED'].includes(String(b.status || '').toUpperCase()))
    return [
      { key: 'all', label: `Toutes (${results.length})`, content: <List bookings={results} onConfirm={confirm} /> },
      { key: 'pending', label: `À confirmer (${pending.length})`, content: <List bookings={pending} onConfirm={confirm} /> },
      { key: 'active', label: `En cours (${active.length})`, content: <List bookings={active} onConfirm={confirm} /> },
      { key: 'done', label: `Terminées (${done.length})`, content: <List bookings={done} onConfirm={confirm} /> },
    ]
  }, [results])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Sessions</h1>
        <p className="mt-1 text-sm text-ink-3">Confirmes les réservations et suis les sessions en cours.</p>
      </div>

      {bookings.loading && <PageLoader />}
      {!bookings.loading && bookings.error && <ErrorState message={bookings.error} onRetry={bookings.refresh} />}
      {!bookings.loading && !bookings.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="Pas encore de demandes"
            description="Les demandes de réservation envoyées par les apprenants apparaîtront ici."
          />
        </Card>
      )}
      {!bookings.loading && !bookings.error && results.length > 0 && <Tabs tabs={tabs} />}
    </div>
  )
}

function List({ bookings, onConfirm }) {
  if (!bookings.length) return <EmptyState title="Rien ici" description="Aucune session dans cette catégorie." />
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} isMentor onConfirm={onConfirm ? () => onConfirm(b.id) : null} />
      ))}
    </div>
  )
}

function normalize(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data.results)) return data.results
  return []
}
