import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FlaskConical, TrendingUp } from 'lucide-react'
import { coursesService, paginate } from '../../services/courses.service'
import { useFetch } from '../../hooks/useFetch'
import { Card, EmptyState, ErrorState, ProgressBar, GridSkeleton, Badge } from '../../components/ui'

export default function ProgressPage() {
  const learning = useFetch(() => coursesService.getMyCourses().then(paginate), [])
  const results = learning.data?.results || []
  const active = results.filter((c) => (c.progress_pct ?? 0) > 0 && (c.progress_pct ?? 0) < 100)
  const done = results.filter((c) => (c.progress_pct ?? 0) >= 100)
  const avg = results.length ? results.reduce((s, c) => s + (c.progress_pct ?? 0), 0) / results.length : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Progression</h1>
        <p className="mt-1 text-sm text-ink-3">Ton avancée sur chaque parcours.</p>
      </div>

      {learning.loading && <GridSkeleton count={3} />}
      {!learning.loading && learning.error && <ErrorState message={learning.error} onRetry={learning.refresh} />}

      {!learning.loading && !learning.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={TrendingUp}
            title="Pas encore de progression"
            description="Inscris-toi à un cours pour voir ta progression ici."
          />
        </Card>
      )}

      {!learning.loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5">
              <p className="text-sm text-ink-3">Progression moyenne</p>
              <p className="mt-1 text-3xl font-bold text-brand-blue">{Math.round(avg)}%</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-ink-3">Cours en cours</p>
              <p className="mt-1 text-3xl font-bold text-ink">{active.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-ink-3">Cours terminés</p>
              <p className="mt-1 text-3xl font-bold text-success">{done.length}</p>
            </Card>
          </div>

          <div className="space-y-4">
            {results.map((c) => {
              const pct = c.progress_pct ?? 0
              return (
                <Card key={c.id} className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-ink truncate">{c.title}</h3>
                        {pct >= 100 && <Badge tone="success">Terminé</Badge>}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <ProgressBar value={pct} tone={pct >= 100 ? 'success' : 'blue'} className="flex-1" />
                        <span className="text-sm font-medium text-ink-2 shrink-0">{Math.round(pct)}%</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-3">
                        <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {c.lessons_count ?? '—'} leçons</span>
                        {typeof c.quizzes_count === 'number' && (
                          <span className="inline-flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" /> {c.quizzes_count} quiz</span>
                        )}
                      </div>
                    </div>
                    <Link to={`/learning/${c.id}`} className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
                      {pct >= 100 ? 'Revoir' : 'Continuer'} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}