import { Link } from 'react-router-dom'
import { Award, Gauge, MapPin, Star } from 'lucide-react'
import { Avatar, Badge } from '../ui'
import { getAvatar, getFullName } from '../../lib/format'

export function MentorCard({ mentor, className = '', distance }) {
  const m = mentor || {}
  const rating = Number(m.rating ?? m.average_rating ?? 0)
  const verified = m.is_verified || m.verification_status === 'VERIFIED'
  const subjects = m.subjects || m.skills || [
    m.subject || m.specialty || 'Mentor',
  ]
  const subjectsList = Array.isArray(subjects) ? subjects : [subjects]

  return (
    <Link
      to={`/mentors/${m.id}`}
      className="group bg-surface rounded-lg border border-line shadow-1 p-5 hover:shadow-2 hover:border-line transition-all flex flex-col"
    >
      <div className="flex items-center gap-4">
        <Avatar src={getAvatar(m)} alt={getFullName(m)} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-ink group-hover:text-brand-blue transition-colors">
              {getFullName(m)}
            </h3>
            {verified && (
              <Badge tone="success">
                <Award className="w-3 h-3" /> Vérifié
              </Badge>
            )}
          </div>
          <p className="text-sm text-ink-3 truncate">
            {m.headline || m.title || m.bio || 'Mentor certifié'}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {subjectsList.slice(0, 3).map((s, i) => (
          <Badge key={i} tone="blue">
            {s}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-ink-3 pt-4 border-t border-line">
        {rating > 0 && (
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" /> {rating.toFixed(1)}
          </span>
        )}
        {typeof m.hourly_rate === 'number' && m.hourly_rate > 0 && (
          <span className="font-medium text-ink-2">{m.hourly_rate.toLocaleString('fr-FR')} BIF/h</span>
        )}
        {typeof m.session_price === 'number' && m.session_price > 0 && (
          <span className="font-medium text-ink-2">{m.session_price.toLocaleString('fr-FR')} BIF</span>
        )}
        {distance !== undefined && (
          <span className="inline-flex items-center gap-1 ml-auto">
            <MapPin className="w-3.5 h-3.5" /> {distance} km
          </span>
        )}
      </div>
    </Link>
  )
}

export function MentorExpertise({ mentor, className = '' }) {
  const m = mentor || {}
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Gauge className="w-4 h-4 text-ink-3" />
        <span className="text-sm font-medium text-ink-2">Expertise</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {(Array.isArray(m.subjects) ? m.subjects : m.skills || []).map((s, i) => (
          <Badge key={i} tone="blue" className="px-3 py-1">
            {s}
          </Badge>
        ))}
      </div>
    </div>
  )
}
