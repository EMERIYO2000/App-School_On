import { Link } from 'react-router-dom'
import { Award, Download, Link2, QrCode, Share2 } from 'lucide-react'
import { Badge, Button, Card } from '../ui'
import { formatDate } from '../../lib/format'

export function CertificateCard({ certificate, className = '' }) {
  const c = certificate || {}
  const status = String(c.status || c.verification_status || 'VALID').toUpperCase()
  const valid = status === 'VALID' || status === 'CERTIFIED'
  const id = c.certificate_id || c.id

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className={`h-1.5 ${valid ? 'bg-gradient-to-r from-brand-terracotta to-brand-blue' : 'bg-surface-3'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`h-11 w-11 rounded-md flex items-center justify-center ${
              valid ? 'bg-brand-terracotta-light text-brand-terracotta-dark' : 'bg-surface-2 text-ink-3'
            }`}
          >
            <Award className="w-6 h-6" aria-hidden />
          </span>
          <Badge tone={valid ? 'success' : 'neutral'}>{valid ? 'Valide' : status}</Badge>
        </div>
        <h3 className="mt-3 font-semibold text-ink line-clamp-1">{c.course_name || c.course || 'Certificat'}</h3>
        <p className="mt-1 text-sm text-ink-3">
          {c.recipient_name || c.student_name || c.user_name || 'Étudiant'} · {formatDate(c.issued_at || c.issue_date)}
        </p>
        <p className="mt-1 font-mono text-xs text-ink-3">{id}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {id && (
            <>
              <Link to={`/certificate/${id}`} className="inline-block">
                <Button size="sm" variant="outline" icon={QrCode}>
                  Vérifier
                </Button>
              </Link>
              {valid && (
                <a href={c.pdf_url}>
                  <Button size="sm" variant="outline" icon={Download}>PDF</Button>
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

export function CertificateActions({ certificate }) {
  const id = certificate?.certificate_id
  if (!id) return null
  const url = `${window.location.origin}/certificate/${id}`
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" icon={Link2} onClick={() => navigator.clipboard?.writeText(url)}>
        Copier le lien
      </Button>
      <Button size="sm" variant="outline" icon={Share2} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Vérifie mon certificat SCHOOL ON : ${url}`)}`, '_blank')}>
        Partager
      </Button>
    </div>
  )
}
