import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { coursesService, paginate } from '../../services/courses.service'
import { useFetch, useDebouncedValue } from '../../hooks/useFetch'
import { COURSE_LEVELS } from '../../lib/constants'
import CourseCard from '../../components/business/CourseCard'
import { Button, Card, EmptyState, ErrorState, GridSkeleton, Select, Badge } from '../../components/ui'

export default function CoursesPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [category, setCategory] = useState(params.get('category') || '')
  const [level, setLevel] = useState('')
  const [stateExam, setStateExam] = useState(false)

  useEffect(() => {
    if (params.get('category')) setCategory(params.get('category'))
  }, [params])

  const query = useMemo(() => {
    const q = {}
    if (debouncedSearch) q.search = debouncedSearch
    if (category) q.category = category
    if (level) q.level = level
    if (stateExam) q.state_exam = true
    return q
  }, [debouncedSearch, category, level, stateExam])

  const courses = useFetch(() => coursesService.getCourses(query).then(paginate), [JSON.stringify(query)])
  const cats = useFetch(() => coursesService.getCategories().then((d) => (Array.isArray(d) ? d : d.results || [])), [])

  const results = courses.data?.results || []
  const categoryList = cats.data || []

  function clearFilters() {
    setCategory('')
    setLevel('')
    setStateExam(false)
    setSearch('')
    setParams({})
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Catalogue des cours</h1>
          <p className="mt-1 text-sm text-ink-3">Trouve le cours qui correspond à ton niveau.</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un cours…"
              className="w-full rounded-md border border-line bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={category} onChange={(e) => { setCategory(e.target.value); setParams({ ...Object.fromEntries(params), category: e.target.value }) }}>
              <option value="">Toutes les catégories</option>
              {categoryList.map((c) => {
                const name = typeof c === 'object' ? c.name || c.title || c.id : c
                const id = typeof c === 'object' ? c.slug || c.id || name : c
                return (
                  <option key={id} value={id}>
                    {name}
                  </option>
                )
              })}
            </Select>
            <Select value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Tous les niveaux</option>
              {COURSE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </Select>
            <Button variant={stateExam ? 'primary' : 'outline'} onClick={() => setStateExam((s) => !s)} icon={stateExam && undefined}>
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Examen d'État
                {stateExam && <Badge tone="blue" className="ml-1">ON</Badge>}
              </span>
            </Button>
          </div>
        </div>
      </Card>

      {courses.loading && <GridSkeleton count={8} />}

      {!courses.loading && courses.error && (
        <ErrorState message={courses.error} onRetry={courses.refresh} />
      )}

      {!courses.loading && !courses.error && results.length === 0 && (
        <Card>
          <EmptyState
            title="Aucun cours trouvé"
            description="Aucun cours ne correspond à tes filtres pour le moment. Essaie d'élargir ta recherche."
            icon={Search}
            action={
              <Button variant="outline" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            }
          />
        </Card>
      )}

      {!courses.loading && !courses.error && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {results.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {typeof courses.data.count === 'number' && courses.data.count > results.length && (
            <p className="text-center text-sm text-ink-3 pt-2">
              {results.length} sur {courses.data.count} cours affichés
            </p>
          )}
        </>
      )}
    </div>
  )
}