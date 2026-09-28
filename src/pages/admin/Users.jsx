import { useMemo } from 'react'
import { Search, Users, ShieldCheck } from 'lucide-react'
import { useFetch, useDebouncedValue } from '../../hooks/useFetch'
import { adminService } from '../../services/profile.service'
import { isNotFound } from '../../services/api'
import { Avatar, Badge, Card, EmptyState, ErrorState, PageLoader, statusTone } from '../../components/ui'

export default function AdminUsersPage({ tab = 'users' }) {
  const onlyMentors = tab === 'mentors'
  const users = useFetch(async () => {
    const data = await adminService.getUsers({ page_size: 100 })
    return Array.isArray(data) ? data : data.results || []
  }, [])
  const results = users.data || []

  const filtered = useMemo(() => {
    let list = results
    if (onlyMentors) list = list.filter((u) => u.is_teacher)
    return list
  }, [results, onlyMentors])

  if (users.loading) return <PageLoader label="Chargement des utilisateurs…" />
  if (users.error && !isNotFound(users.error))
    return <ErrorState message={users.error} onRetry={users.refresh} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">{onlyMentors ? 'Mentors' : 'Utilisateurs'}</h1>
        <p className="mt-1 text-sm text-ink-3">
          {onlyMentors
            ? 'Comptes enseignants/tuteurs inscrits sur la plateforme.'
            : 'Tous les comptes de la plateforme, leur rôle et leur statut.'}
        </p>
        <div className="relative mt-4 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input
            className="w-full rounded-md border border-line bg-body pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            placeholder="Rechercher par nom, email…"
          />
        </div>
      </div>

      {isNotFound(users.error) ? (
        <EmptyState
          icon={onlyMentors ? ShieldCheck : Users}
          title={onlyMentors ? 'Liste des mentors indisponible' : 'Liste des utilisateurs indisponible'}
          description="L'endpoint d'administration n'est pas encore exposé. Il sera activé avec le module admin du backend."
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Aucun utilisateur" description="Aucun compte ne correspond pour le moment." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-line">
            {filtered.map((u) => (
              <li key={u.id} className="p-4 flex items-center gap-3 hover:bg-surface-2/60">
                <Avatar size="md" src={u.avatar} fallback={(u.full_name || u.username || '?')[0]} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{u.full_name || u.username || u.login_id}</p>
                  <p className="text-xs text-ink-3 truncate">{u.email || u.login_id}</p>
                </div>
                {onlyMentors && u.mentor_status && (
                  <Badge tone={statusTone(u.mentor_status)}>{u.mentor_status}</Badge>
                )}
                <Badge tone={u.is_staff || u.is_superuser ? 'success' : u.is_teacher ? 'terracotta' : 'neutral'}>
                  {u.is_staff || u.is_superuser ? 'Admin' : u.is_teacher ? 'Mentor' : 'Apprenant'}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}