import { useMemo, useState } from 'react'
import { Award, Clock, FileText } from 'lucide-react'
import { coursesService, paginate } from '../../services/courses.service'
import { useFetch } from '../../hooks/useFetch'
import { COURSE_LEVELS } from '../../lib/constants'
import CourseCard from '../../components/business/CourseCard'
import { Button, Card, EmptyState, ErrorState, GridSkeleton, Select } from '../../components/ui'

export default function ExamsPage() {
  const [level, setLevel] = useState('')
  const query = useMemo(() => ({ state_exam: true, ...(level ? { level } : {}) }), [level])
  const exams = useFetch(() => coursesService.getCourses(query).then(paginate), [JSON.stringify(query)])
  const results = exams.data?.results || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-warning to-brand-terracotta rounded-lg p-6 sm:p-8 text-white shadow-2">
        <span className="inline-flex items-center gap-2 rounded-pill bg-white/15 px-3 py-1 text-xs font-medium">
          <Award className="w-3.5 h-3.5" /> Examen d'État & 9e année
        </span>
        <h1 className="mt-3 text-2xl sm:text-3xl font-bold">Préparation aux examens</h1>
        <p className="mt-2 text-white/85 text-sm max-w-xl">
          Suis des cours et des séries d'entraînement spécifiques pour aborder sereinement les épreuves nationales.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={level} onChange={(e) => setLevel(e.target.value)} className="w-48">
          <option value="">Tous les niveaux</option>
          {COURSE_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
      </div>

      {exams.loading && <GridSkeleton count={4} />}
      {!exams.loading && exams.error && <ErrorState message={exams.error} onRetry={exams.refresh} />}
      {!exams.loading && !exams.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={FileText}
            title="Pas encore de préparation disponible"
            description="Les séries et cours de préparation aux examens seront publiés ici."
            action={
              <Button variant="outline" onClick={() => setLevel('')}>
                Tout afficher
              </Button>
            }
          />
        </Card>
      )}
      {!exams.loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}