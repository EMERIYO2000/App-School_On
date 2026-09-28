import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarCheck, CreditCard, Users, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useFetch } from '../../hooks/useFetch'
import { coursesService, paginate } from '../../services/courses.service'
import { adminService } from '../../services/profile.service'
import { paymentsService } from '../../services/payments.service'
import { Badge, Card, EmptyState, ErrorState, GridSkeleton, StatCard, Alert, Button } from '../../components/ui'
import { formatMoney } from '../../lib/format'

export default function AdminDashboard({ tab = 'dashboard' }) {
  const users = useFetch(async () => {
    const data = await adminService.getUsers({ page_size: 5 })
    return Array.isArray(data) ? data : data.results || []
  }, [])
  const courses = useFetch(() => coursesService.getCourses().then(paginate), [])
  const txs = useFetch(async () => {
    const data = await paymentsService.getTransactions({ page_size: 5 })
    return Array.isArray(data) ? data : data.results || []
  }, [])

  const userList = users.data || []
  const courseList = courses.data?.results || []
  const txList = txs.data || []

  const stats = useMemo(() => ({
    users: userList.length,
    courses: courseList.length,
    revenue: txList.filter((t) => String(t.status || '').toUpperCase() === 'SUCCESS').reduce((s, t) => s + Number(t.amount || 0), 0),
    payments: txList.length,
  }), [userList, courseList, txList])

  const loading = users.loading || courses.loading
  const hasError = users.error || courses.error

  if (tab === 'reports') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-ink">Rapports</h1>
          <p className="mt-1 text-sm text-ink-3">Synthèse financière et d'activité de la plateforme.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Cours publiés" value={courseList.length} icon={BookOpen} tone="blue" />
          <StatCard label="Paiements" value={stats.payments} icon={CreditCard} tone="success" />
          <StatCard label="Revenu (BIF)" value={formatMoney(stats.revenue)} icon={Users} tone="terracotta" />
          <StatCard label="Sessions" value="—" icon={CalendarCheck} tone="neutral" />
        </div>
        <Alert.Info title="Rapports détaillés">
          Les rapports (exports CSV/PDF, périodes, répartition par catégorie) seront disponibles avec le module de
          reporting du backend.
        </Alert.Info>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Tableau de bord</h1>
        <p className="mt-1 text-sm text-ink-3">Vue d'ensemble de la plateforme SCHOOL ON.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Utilisateurs" value={userList.length || '—'} icon={Users} tone="blue" />
        <StatCard label="Cours" value={courseList.length || '—'} icon={BookOpen} tone="terracotta" />
        <StatCard label="Paiements" value={stats.payments || '—'} icon={CreditCard} tone="success" />
        <StatCard label="Sessions" value="—" icon={CalendarCheck} tone="neutral" />
      </div>

      {loading && <GridSkeleton count={2} />}
      {!loading && hasError && <ErrorState message={hasError} />}
      {!loading && !hasError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Derniers utilisateurs</h2>
              <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {userList.length === 0 ? (
              <EmptyState icon={Users} title="Aucun utilisateur" description="Les inscrits apparaîtront ici." />
            ) : (
              <ul className="divide-y divide-line">
                {userList.slice(0, 5).map((u) => (
                  <li key={u.id} className="py-2.5 flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-surface-2 flex items-center justify-center text-xs font-semibold text-ink-2">
                      {(u.full_name || u.username || '?')[0]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{u.full_name || u.username || u.login_id}</p>
                      <p className="text-xs text-ink-3 truncate">{u.email || u.login_id}</p>
                    </div>
                    <Badge tone={u.is_staff || u.is_superuser ? 'success' : u.is_teacher ? 'terracotta' : 'neutral'}>
                      {u.is_staff || u.is_superuser ? 'Admin' : u.is_teacher ? 'Mentor' : 'Apprenant'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Derniers cours</h2>
              <Link to="/admin/courses" className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
                Tout voir <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {courseList.length === 0 ? (
              <EmptyState icon={BookOpen} title="Aucun cours" description="Les cours créés par la communauté apparaîtront ici." />
            ) : (
              <ul className="divide-y divide-line">
                {courseList.slice(0, 5).map((c) => (
                  <li key={c.id} className="py-2.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{c.title}</p>
                      <p className="text-xs text-ink-3">{c.category?.name || c.category || 'Sans catégorie'}</p>
                    </div>
                    <Badge tone={String(c.status || '').toUpperCase() === 'PUBLISHED' ? 'success' : 'warning'}>{c.status || 'DRAFT'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {!loading && !hasError && (
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-info-light text-info flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
            <div className="flex-1">
              <h3 className="font-semibold text-ink">Modération et conformité</h3>
              <p className="text-sm text-ink-3">Contenus signalés et demandes en attente de traitement.</p>
            </div>
            <Link to="/admin/moderation"><Button variant="outline" icon={AlertTriangle}>Modérer</Button></Link>
          </div>
        </Card>
      )}
    </div>
  )
}
