import { useNavigate, useParams } from 'react-router-dom'
import { Award, QrCode, ShieldCheck } from 'lucide-react'
import { certificatesService } from '../../services/extras.service'
import { useFetch } from '../../hooks/useFetch'
import { Badge, ErrorState, PageLoader, Card } from '../../components/ui'
import { formatDate } from '../../lib/format'

export default function VerifyCertificatePage() {
  const { certificateId } = useParams()
  const navigate = useNavigate()

  const { data, loading, error, run } = useFetch(
    () => certificatesService.verify(certificateId),
    [certificateId],
    { autoload: Boolean(certificateId) }
  )

  if (!certificateId) {
    return (
      <div className="min-h-screen bg-body flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md text-center">
          <span className="inline-flex h-16 w-16 rounded-full bg-brand-blue-light text-brand-blue items-center justify-center">
            <QrCode className="w-8 h-8" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-ink">Vérifier un certificat</h1>
          <p className="mt-2 text-sm text-ink-3">
            Saisis l'identifiant unique du certificat (ex. SO-CERT-2026-000184).
          </p>
          <form
            className="mt-6 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const id = new FormData(e.currentTarget).get('id').trim().replace(/^\/|\/$/g, '')
              if (id) navigate(`/certificate/${encodeURIComponent(id)}`)
            }}
          >
            <input
              name="id"
              className="flex-1 rounded-md border border-line bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              placeholder="SO-CERT-2026-000184"
              required
            />
            <button className="rounded-md bg-brand-blue px-5 text-sm font-medium text-white hover:bg-brand-blue-dark">
              Vérifier
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen bg-body py-24"><PageLoader label="Vérification du certificat…" /></div>
  if (error)
    return (
      <div className="min-h-screen bg-body flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <ErrorState
            title="Certificat introuvable"
            message="Ce certificat n'existe pas ou son identifiant est invalide. Vérifie le lien fourni par le détenteur."
          />
        </div>
      </div>
    )

  const c = data || {}
  const status = String(c.status || 'VALID').toUpperCase()
  const valid = status === 'VALID' || c.is_valid

  return (
    <div className="min-h-screen bg-body flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Badge tone={valid ? 'success' : 'error'}>{valid ? 'Certificat valide' : 'Certificat invalide'}</Badge>
        </div>
        <Card className={`relative overflow-hidden border-2 ${valid ? 'border-brand-terracotta/40' : 'border-error/40'}`}>
          <div className={`h-3 ${valid ? 'bg-gradient-to-r from-brand-terracotta via-warning to-brand-blue' : 'bg-error'}`} />
          {valid && (
            <img
              src="/certificate-template.jfif"
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
            />
          )}
          <div className="relative p-6 sm:p-10 text-center">
            <img src="/logo-full.png" alt="SCHOOL ON" className="mx-auto w-24 mb-5" />
            <span className="inline-flex h-14 w-14 rounded-full bg-success-light text-success items-center justify-center">
              <Award className="w-7 h-7" />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta-dark">Attestation officielle</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">Certificat de réussite</h1>
            <p className="mt-1 font-mono text-sm text-ink-3">{c.certificate_id || certificateId}</p>
            <p className="mt-6 text-sm text-ink-3">Décerné à</p>
            <p className="text-xl font-semibold text-ink">{c.recipient_name || c.student_name || 'Étudiant'}</p>
            <p className="mt-4 text-sm text-ink-3">Pour avoir complété avec succès</p>
            <p className="text-base font-semibold text-brand-blue-dark">{c.course_name || c.course || 'le parcours'}</p>
            <div className="mt-7 grid grid-cols-2 gap-4 border-y border-line py-4 text-xs text-ink-3">
              <div className="text-left">
                <p className="font-medium text-ink">Mentor</p>
                <p>{c.mentor_name || '—'}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-ink">Date</p>
                <p>{formatDate(c.issued_at || c.issue_date)}</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-ink-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Vérifié sur SCHOOL ON
            </p>
          </div>
        </Card>
        {c.student_name && !valid && (
          <p className="mt-4 text-center text-sm text-error">
            Si tu penses que c'est une erreur, contacte le support de SCHOOL ON.
          </p>
        )}
      </div>
    </div>
  )
}
