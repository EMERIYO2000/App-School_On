import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, FlaskConical, PenLine } from 'lucide-react'
import { coursesService, paginate } from '../../services/courses.service'
import { useFetch } from '../../hooks/useFetch'
import CourseCard from '../../components/business/CourseCard'
import { Card, EmptyState, GridSkeleton, Button, ProgressBar, Badge, ErrorState } from '../../components/ui'
import { useToast } from '../../components/ui/Toast'
import { getError } from '../../services/api'

export default function LearningPage() {
  const myCourses = useFetch(() => coursesService.getMyCourses().then(paginate), [])
  const results = myCourses.data?.results || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Mes cours</h1>
        <p className="mt-1 text-sm text-ink-3">Reprends là où tu t'es arrêté.</p>
      </div>

      {myCourses.loading && <GridSkeleton count={6} />}
      {!myCourses.loading && myCourses.error && <ErrorState message={myCourses.error} onRetry={myCourses.refresh} />}

      {!myCourses.loading && !myCourses.error && results.length === 0 && (
        <Card>
          <EmptyState
            title="Tu n'es pas encore inscrit à un cours"
            description="Parcours le catalogue et rejoins un cours gratuit ou premium pour commencer."
            icon={BookOpen}
            action={
              <Link to="/courses">
                <Button icon={BookOpen}>Explorer le catalogue</Button>
              </Link>
            }
          />
        </Card>
      )}

      {!myCourses.loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((c) => {
            const pct = c.progress_pct ?? 0
            return (
              <div key={c.id} className="bg-surface rounded-lg border border-line shadow-1 overflow-hidden">
                <CourseCard course={c} progress={pct} className="border-0 shadow-none" />
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ProgressBar value={pct} tone={pct >= 100 ? 'success' : 'blue'} className="flex-1" />
                    <span className="text-xs font-medium text-ink-2 shrink-0">{Math.round(pct)}%</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/learning/${c.id}`} className="flex-1">
                      <Button size="sm" fullWidth icon={PenLine}>
                        {pct > 0 ? 'Continuer' : 'Commencer'}
                      </Button>
                    </Link>
                    {c.quizzes_count > 0 && (
                      <Link to={`/quiz?course=${c.id}`} className="flex-1">
                        <Button size="sm" variant="outline" fullWidth icon={FlaskConical}>
                          Quiz
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}