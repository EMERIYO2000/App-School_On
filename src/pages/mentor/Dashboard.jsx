import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarCheck, GraduationCap, PenLine, ShieldCheck, Users, Wallet } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { coursesService, paginate } from '../../services/courses.service'
import { useFetch } from '../../hooks/useFetch'
import { MENTOR_STATUSES } from '../../lib/constants'
import { Badge, Button, Card, GridSkeleton, StatCard } from '../../components/ui'

export default function MentorDashboard() {
  const { user } = useAuth()
  const courses = useFetch(() => coursesService.getMyCourses().then(paginate), [])
  const results = courses.data?.results || []
  const status = user?.mentor_status || user?.tutor?.status || 'PENDING_VERIFICATION'
  const verified = status === 'VERIFIED'

  const firstName = user?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-gradient-to-br from-brand-terracotta-dark via-brand-terracotta to-brand-terracotta rounded-lg p-6 sm:p-8 text-white shadow-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <p className="text-white/80 text-sm capitalize">
            Bonjour{firstName ? ', ' : ''}{firstName}{' '}
            <GraduationCap className="w-4 h-4 inline" aria-hidden />
          </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Ton espace mentor</h1>
            <p className="mt-2 text-white/85 text-sm max-w-xl">
              {verified
                ? 'Gère tes cours, réserve des sessions et suis tes gains.'
                : 'Finalise ta vérification pour publier des cours et accepter des sessions.'}
            </p>
          </div>
          <Badge tone={verified ? 'success' : 'warning'} className="self-start lg:self-center">
            <ShieldCheck className="w-3.5 h-3.5" /> {MENTOR_STATUSES[status] || status}
          </Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/mentor/courses/create">
            <Button className="bg-surface text-brand-terracotta-dark hover:bg-surface-2" icon={PenLine}>
              Créer un cours
            </Button>
          </Link>
          <Link to="/mentor/verification">
            <Button variant="ghost" className="text-white hover:bg-white/15" icon={ShieldCheck}>
              Vérifier mon profil
            </Button>
          </Link>
        </div>
      </div>

      {!verified && (
        <Card className="p-5 border-warning/40 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <h3 className="font-semibold text-ink">Profil en attente de vérification</h3>
            <p className="mt-1 text-sm text-ink-3">
              La vérification protège les apprenants et renforce ta crédibilité. Complète tes informations pour être
              approuvé.
            </p>
          </div>
          <Link to="/mentor/verification">
            <Button variant="outline" icon={ShieldCheck}>Compléter</Button>
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cours publiés" value={results.length} icon={BookOpen} tone="terracotta" />
        <StatCard label="Apprenants" value={results.reduce((s, c) => s + (c.students_count ?? 0), 0)} icon={Users} tone="blue" />
        <StatCard label="Sessions" value={'—'} icon={CalendarCheck} tone="neutral" />
        <StatCard label="Gains (FCFA)" value={'—'} icon={Wallet} tone="success" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Mes cours</h2>
          <Link to="/mentor/courses" className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
            Gérer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {courses.loading && <GridSkeleton count={3} />}
        {!courses.loading && results.length === 0 && (
          <Card className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="mt-3 font-semibold text-ink">Aucun cours encore</h3>
            <p className="mt-1 text-sm text-ink-3">Crée ton premier cours pour commencer à transmettre ton savoir.</p>
            <Link to="/mentor/courses/create" className="mt-4 inline-block">
              <Button icon={PenLine}>Créer mon premier cours</Button>
            </Link>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {!courses.loading &&
            results.slice(0, 6).map((c) => (
              <div key={c.id} className="bg-surface rounded-lg border border-line shadow-1 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink line-clamp-1 flex-1">{c.title}</h3>
                  <Badge tone={String(c.status || '').toUpperCase() === 'PUBLISHED' ? 'success' : 'warning'}>{c.status || 'DRAFT'}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-3 line-clamp-2 flex-1">{c.short_description || c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-3">{c.students_count ?? 0} apprenants</span>
                  <Link to={`/mentor/courses/${c.id}`} className="text-sm font-medium text-brand-blue hover:underline">
                    Détails
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}