import { Users } from 'lucide-react'
import { coursesService, paginate } from '../../services/courses.service'
import { useFetch } from '../../hooks/useFetch'
import { Card, EmptyState, ErrorState, PageLoader, Avatar } from '../../components/ui'
import { formatDate, getAvatar, getFullName } from '../../lib/format'

export default function MentorLearnersPage() {
  const courses = useFetch(() => coursesService.getMyCourses().then(paginate), [])
  const results = courses.data?.results || []
  const learners = results.flatMap((c) =>
    (c.learners || c.students || c.enrollments || []).map((l) => ({ ...l, course: c.title, course_id: c.id }))
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mes apprenants</h1>
        <p className="mt-1 text-sm text-ink-3">Les personnes inscrites à tes cours.</p>
      </div>

      {courses.loading && <PageLoader />}
      {!courses.loading && courses.error && <ErrorState message={courses.error} onRetry={courses.refresh} />}
      {!courses.loading && !courses.error && learners.length === 0 && (
        <Card>
          <EmptyState
            icon={Users}
            title="Aucun apprenant pour l'instant"
            description="Dès qu'une personne s'inscrit à un cours publié, elle apparaît ici."
          />
        </Card>
      )}

      {!courses.loading && learners.length > 0 && (
        <div className="bg-surface rounded-lg border border-line shadow-1 divide-y divide-line">
          {learners.map((l, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Avatar src={getAvatar(l)} alt={getFullName(l)} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{getFullName(l)}</p>
                <p className="text-xs text-ink-3 truncate">{l.email || `Inscrit à ${l.course}`}</p>
              </div>
              <span className="text-xs text-ink-3 hidden sm:block">{l.course}</span>
              <span className="text-xs text-ink-3">{formatDate(l.enrolled_at || l.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}