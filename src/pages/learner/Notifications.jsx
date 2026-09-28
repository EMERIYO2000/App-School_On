import { Bell, Check } from 'lucide-react'
import { useFetch } from '../../hooks/useFetch'
import { Button, Card, EmptyState, ErrorState, PageLoader } from '../../components/ui'
import { notificationsService } from '../../services/extras.service'
import { getError } from '../../services/api'
import { formatDate } from '../../lib/format'
import { useToast } from '../../components/ui/Toast'

export default function NotificationsPage() {
  const toast = useToast?.()
  const notifications = useFetch(() => notificationsService.getNotifications(), [])
  const items = Array.isArray(notifications.data) ? notifications.data : notifications.data?.results || []

  async function markRead(id) {
    try {
      await notificationsService.markRead(id)
      notifications.refresh()
    } catch (error) {
      toast?.error?.('Action impossible', getError(error))
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-ink">Notifications</h1>
      {notifications.loading && <PageLoader label="Chargement des notifications…" />}
      {!notifications.loading && notifications.error && <ErrorState message={notifications.error} onRetry={notifications.refresh} />}
      {!notifications.loading && !notifications.error && items.length === 0 && <Card><EmptyState icon={Bell} title="Aucune notification" description="Tes notifications de cours, de paiement et de réservation apparaîtront ici." /></Card>}
      {!notifications.loading && !notifications.error && items.length > 0 && <div className="space-y-3">
        {items.map((item) => <Card key={item.id} className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><h2 className="font-semibold text-ink">{item.title}</h2>{!item.is_read && <span className="h-2 w-2 rounded-full bg-blue-600" />}</div>
            <p className="mt-1 text-sm text-ink-2">{item.message}</p>
            <p className="mt-2 text-xs text-ink-3">{formatDate(item.created_at)}</p>
          </div>
          {!item.is_read && <Button size="sm" variant="outline" icon={Check} onClick={() => markRead(item.id)}>Lu</Button>}
        </Card>)}
      </div>}
    </div>
  )
}
