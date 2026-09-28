import { Link } from 'react-router-dom'
import { ArrowRight, Award, BookOpen, CalendarCheck, MessagesSquare, PenLine, Users, Hand } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { coursesService, paginate } from '../../services/courses.service'
import { paymentsService } from '../../services/payments.service'
import { useFetch } from '../../hooks/useFetch'
import { LEARNER_MAIN_ACTIONS } from '../../lib/constants'
import { Badge, Button, Card, GridSkeleton, ProgressBar, StatCard } from '../../components/ui'
import CourseCard from '../../components/business/CourseCard'

const actionIcons = { learn: BookOpen, train: PenLine, mentor: Users, community: MessagesSquare }

export default function LearnerDashboard() {
  const { user } = useAuth()
  const courses = useFetch(() => coursesService.getMyCourses().then(paginate), [])
  const transactions = useFetch(() => paymentsService.getTransactions().then(paginate), [])

  const myCourses = courses.data?.results || []
  const stats = courses.data?.stats || {}

  const firstName = user?.full_name?.split(' ')[0] || user?.first_name || ''

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-blue-light rounded-lg p-6 sm:p-8 text-white shadow-2">
        <p className="text-white/80 text-sm capitalize">
          Bonjour{firstName ? ', ' : ''}{firstName}{' '}
          <Hand className="w-4 h-4 inline" aria-hidden />
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Prêt à progresser aujourd'hui ?</h1>
        <p className="mt-2 text-white/85 text-sm max-w-xl">
          Reprends ton dernier cours ou explore un nouveau sujet.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/courses">
            <Button variant="white" size="md" icon={BookOpen} className="bg-surface text-brand-blue-dark hover:bg-surface-2">
              Explorer les cours
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="ghost" size="md" className="text-white hover:bg-white/15">
              Voir ma progression
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Que veux-tu faire ?</h2>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-4 gap-4">
          {LEARNER_MAIN_ACTIONS.map((a) => {
            const Icon = actionIcons[a.key] || BookOpen
            return (
              <Link
                key={a.key}
                to={a.to}
                className="group bg-surface rounded-lg border border-line shadow-1 p-5 hover:shadow-2 hover:border-brand-blue transition-all"
              >
                <span
                  className={`h-11 w-11 rounded-md flex items-center justify-center ${
                    a.accent === 'terracotta' ? 'bg-brand-terracotta-light text-brand-terracotta-dark' : 'bg-brand-blue-light text-brand-blue-dark'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <p className="mt-3 font-semibold text-ink group-hover:text-brand-blue transition-colors">{a.title}</p>
                <p className="mt-1 text-sm text-ink-3">{a.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                  Ouvrir <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cours suivis" value={courses.data?.count ?? myCourses.length} icon={BookOpen} tone="blue" />
        <StatCard label="Cours terminés" value={myCourses.filter((c) => (c.progress_pct ?? 0) >= 100).length ?? '—'} icon={Award} tone="success" />
        <StatCard label="Certificats" value={'—'} icon={Award} tone="terracotta" />
        <StatCard label="Progressions" value={stats?.avg_progress ? `${Math.round(stats.avg_progress)}%` : '—'} icon={PenLine} tone="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Mes cours</h2>
            <Link to="/learning" className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
              Tout voir <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {courses.loading && <GridSkeleton count={4} />}
          {!courses.loading && myCourses.length === 0 && (
            <Card className="p-8 text-center">
              <BookOpen className="w-10 h-10 text-neutral-300 mx-auto" />
              <h3 className="mt-3 font-semibold text-ink">Aucun cours pour l'instant</h3>
              <p className="mt-1 text-sm text-ink-3">Explore le catalogue pour commencer ton premier cours.</p>
              <Link to="/courses" className="mt-4 inline-block">
                <Button>Découvrir le catalogue</Button>
              </Link>
            </Card>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {!courses.loading && myCourses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} course={course} progress={course.progress_pct} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Ma progression</h2>
            <Badge tone="blue">XP en cours</Badge>
          </div>
          <Card className="p-5">
            {myCourses.length === 0 ? (
              <p className="text-sm text-ink-3 text-center py-6">
                Ta progression apparaîtra ici dès que tu commenceras un cours.
              </p>
            ) : (
              <div className="space-y-4">
                {myCourses.slice(0, 4).map((c) => {
                  const pct = c.progress_pct ?? 0
                  return (
                    <Link to={`/learning/${c.id}`} key={c.id} className="block group">
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-ink truncate group-hover:text-brand-blue">{c.title}</span>
                        <span className="text-ink-3 shrink-0 ml-2">{Math.round(pct)}%</span>
                      </div>
                      <ProgressBar value={pct} tone={pct >= 100 ? 'success' : 'blue'} />
                    </Link>
                  )
                })}
                <Link to="/progress" className="block pt-2 text-center text-sm font-medium text-brand-blue hover:underline">
                  Voir le détail
                </Link>
              </div>
            )}
          </Card>

          <div className="mt-6 bg-gradient-to-br from-brand-terracotta via-brand-terracotta-dark to-brand-terracotta rounded-lg p-5 text-white">
            <CalendarCheck className="w-6 h-6 text-white" />
            <h3 className="mt-2 font-semibold">Réserve un mentor</h3>
            <p className="mt-1 text-sm text-white/80">
              Une session ciblée peut débloquer tes difficultés.
            </p>
            <Link to="/mentors" className="mt-3 inline-block">
              <Button size="sm" variant="outline" className="bg-white/15 border-white/30 text-white hover:bg-white/25">
                Trouver un mentor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}