import { useMemo } from 'react'
import { CalendarCheck, Clock4 } from 'lucide-react'
import { paymentsService, paginate } from '../../services/payments.service'
import { useFetch } from '../../hooks/useFetch'
import BookingCard from '../../components/business/BookingCard'
import { Card, EmptyState, ErrorState, PageLoader, Tabs } from '../../components/ui'

export default function BookingsPage() {
  const bookings = useFetch(() => paymentsService.getBookings().then(paginate), [])
  const results = bookings.data?.results || []

  const tabs = useMemo(() => {
    const upcoming = results.filter((b) => ['PENDING', 'PENDING_PAYMENT', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(String(b.status || '').toUpperCase()))
    const past = results.filter((b) => ['COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED'].includes(String(b.status || '').toUpperCase()))
    return [
      { key: 'all', label: `Toutes (${results.length})`, content: <List bookings={results} /> },
      { key: 'upcoming', label: `À venir (${upcoming.length})`, content: <List bookings={upcoming} /> },
      { key: 'past', label: `Passées (${past.length})`, content: <List bookings={past} /> },
    ]
  }, [results])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mes sessions</h1>
        <p className="mt-1 text-sm text-ink-3">Réservations de mentorat, confirmations et historique.</p>
      </div>

      {bookings.loading && <PageLoader label="Chargement des sessions…" />}
      {!bookings.loading && bookings.error && <ErrorState message={bookings.error} onRetry={bookings.refresh} />}
      {!bookings.loading && !bookings.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="Aucune session pour l'instant"
            description="Réserve une session avec un mentor vérifié et elle apparaîtra ici."
          />
        </Card>
      )}
      {!bookings.loading && !bookings.error && results.length > 0 && <Tabs tabs={tabs} />}
    </div>
  )
}

function List({ bookings }) {
  if (!bookings.length)
    return <EmptyState icon={Clock4} title="Rien ici" description="Aucune session dans cette catégorie." />
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  )
}
