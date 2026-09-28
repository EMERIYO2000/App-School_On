import { Link } from 'react-router-dom'
import { BookOpen, Clock, Users } from 'lucide-react'
import { Badge } from '../ui'

const levelLabels = { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé' }

export default function CourseCard({ course, progress, className = '' }) {
  const c = course || {}
  const thumb = c.thumbnail || c.image || c.poster || ''
  const level = c.level || c.difficulty
  const price = Number(c.price ?? c.amount ?? 0)
  const isPremium = c.is_premium || price > 0 || c.is_paid
  const lessonCount = c.lessons_count ?? c.lesson_count ?? c.total_lessons
  const enrollCount = c.students_count ?? c.enrolled_count ?? c.enrollments_count
  const pct = progress ?? c.progress_pct

  return (
    <Link
      to={`/courses/${c.id}`}
      className={`group bg-surface rounded-lg border border-line shadow-1 overflow-hidden hover:shadow-2 hover:border-line transition-all flex flex-col ${className}`}
    >
      <div className="relative aspect-[16/9] bg-surface-2 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={c.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue-light to-brand-terracotta-light">
            <BookOpen className="w-10 h-10 text-brand-blue" aria-hidden />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {isPremium ? (
            <Badge tone="terracotta">Premium</Badge>
          ) : (
            <Badge tone="success">Gratuit</Badge>
          )}
          {level && <Badge tone="neutral">{levelLabels[level] || level}</Badge>}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-medium text-brand-terracotta-dark uppercase tracking-wide">
          {c.category_name || c.category_display || (c.category && typeof c.category === 'object' ? c.category.name : c.category) || 'Cours'}
        </p>
        <h3 className="mt-1 line-clamp-2 font-semibold text-ink group-hover:text-brand-blue transition-colors">
          {c.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-3">{c.short_description || c.description || ''}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-3">
          {typeof lessonCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" aria-hidden /> {lessonCount} leçons
            </span>
          )}
          {typeof enrollCount === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" aria-hidden /> {enrollCount}
            </span>
          )}
          <span className="inline-flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {isPremium ? price.toLocaleString('fr-FR') : 'Gratuit'}
          </span>
        </div>
        {typeof pct === 'number' && pct > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-ink-3 mb-1">
              <span>Progression</span>
              <span className="font-medium text-ink-2">{Math.round(pct)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-brand-blue rounded-full" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
