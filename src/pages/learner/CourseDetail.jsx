import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, ChevronRight, Clock, CreditCard, Copy, PenLine, Users } from 'lucide-react'
import { coursesService, paginate } from '../../services/courses.service'
import { paymentsService } from '../../services/payments.service'
import { useFetch, useAsyncAction } from '../../hooks/useFetch'
import { getError } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { Badge, Button, Card, ErrorState, PageLoader, Modal, Select, Alert } from '../../components/ui'

const levelLabels = { DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé' }

export default function CourseDetailPage() {
  const { courseId: id } = useParams()
  const navigate = useNavigate()
  const { toast } = { toast: useToast() }
  const course = useFetch(() => coursesService.getCourse(id), [id])
  const [payOpen, setPayOpen] = useState(false)
  const [createdPayment, setCreatedPayment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('bitcoin')
  const [bitliberaPhone, setBitliberaPhone] = useState('')
  const [bitliberaOtp, setBitliberaOtp] = useState('')
  const [bitliberaOtpSent, setBitliberaOtpSent] = useState(false)
  const payment = useAsyncAction((payload) => paymentsService.createTransaction(payload))

  useEffect(() => {
    if (!createdPayment?.transaction_id || createdPayment.status !== 'PENDING') return undefined
    let cancelled = false
    let timer
    const refreshPayment = async () => {
      try {
        const latest = await paymentsService.getTransaction(createdPayment.transaction_id)
        if (cancelled) return
        setCreatedPayment(latest)
        if (latest.status === 'PAID') course.refresh()
        else if (latest.status === 'PENDING') timer = setTimeout(refreshPayment, 7000)
      } catch {
        if (!cancelled) timer = setTimeout(refreshPayment, 12000)
      }
    }
    timer = setTimeout(refreshPayment, 5000)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [createdPayment?.transaction_id, createdPayment?.status, createdPayment?.provider_payment_request, course.refresh])

  const c = course.data || {}
  const isPremium = c.is_premium || Number(c.price ?? c.amount ?? 0) > 0 || c.is_paid
  const price = Number(c.price ?? c.amount ?? 0)
  const enrolled = c.is_enrolled || c.enrollment?.status === 'active'
  const chapters = c.chapters || []
  const lessons = c.lessons || chapters.flatMap((ch) => ch.lessons || [])
  const thumb = c.thumbnail || c.image || c.poster || ''

  async function enroll() {
    try {
      await coursesService.enroll(id)
      await course.refresh()
      toast.success('Inscription réussie', 'Tu peux maintenant commencer le cours.')
    } catch (e) {
      toast.error('Inscription impossible', getError(e))
    }
  }

  async function startPayment(payload) {
    try {
      const created = await payment.run({
        course_id: Number(id),
        payment_method: payload.payment_method,
        idempotency_key: globalThis.crypto?.randomUUID?.() || `course-${id}-${Date.now()}`,
        ...(payload.payment_method === 'bitlibera' ? {
          bitlibera_phone: payload.bitlibera_phone,
          bitlibera_otp: payload.bitlibera_otp,
        } : {}),
      })
      setCreatedPayment(created)
      setPayOpen(false)
      toast.success('Transaction initiée', 'Ta demande de paiement a été enregistrée. Suis les instructions.')
    } catch (e) {
      toast.error('Paiement impossible', getError(e))
    }
  }

  if (course.loading) return <PageLoader label="Chargement du cours…" />
  if (course.error) return <ErrorState message={course.error} onRetry={course.refresh} />

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative aspect-[16/6] min-h-[180px] bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-terracotta">
          {thumb && <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white">
            <div className="flex flex-wrap gap-2 mb-2">
              {isPremium ? <Badge tone="terracotta">Cours premium</Badge> : <Badge tone="success">Cours gratuit</Badge>}
              {c.level && <Badge tone="neutral">{levelLabels[c.level] || c.level}</Badge>}
              {c.state_exam && <Badge tone="warning">Examen d'État</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{c.title}</h1>
            <p className="mt-1 text-white/80 text-sm">{c.category_name || c.category || ''}</p>
          </div>
        </div>
        <div className="p-5 sm:p-7 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink-2 leading-relaxed whitespace-pre-line">{c.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-ink-3">
              {typeof (lessons.length || c.lessons_count) === 'number' && (
                <span className="inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {lessons.length || c.lessons_count || 0} leçons</span>
              )}
              <span className="inline-flex items-center gap-1.5"><Users className="w-4 h-4" /> {c.students_count ?? c.enrolled_count ?? 0} apprenants</span>
              {c.duration && <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" /> {c.duration}</span>}
            </div>
          </div>
          <div className="lg:w-72 shrink-0 rounded-lg border border-line bg-body p-5 self-start w-full">
            <p className="text-2xl font-bold text-ink">{isPremium ? `${price.toLocaleString('fr-FR')} BIF` : 'Gratuit'}</p>
            <p className="text-xs text-ink-3 mt-1">
              {isPremium ? 'Paiement sécurisé avant accès complet.' : 'Inscription libre.'}
            </p>
            <div className="mt-4 space-y-2">
              {enrolled ? (
                <Link to={`/learning/${c.id}`}>
                  <Button fullWidth icon={PenLine}>Continuer le cours</Button>
                </Link>
              ) : isPremium ? (
                <>
                  <Button fullWidth icon={CreditCard} onClick={() => setPayOpen(true)}>Payer et s'inscrire</Button>
                </>
              ) : (
                <Button fullWidth icon={BookOpen} onClick={enroll}>S'inscrire gratuitement</Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {createdPayment?.provider_payment_request && createdPayment.status === 'PENDING' && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold text-ink">Invoice Lightning en attente</h2>
          <p className="text-sm text-ink-2">Scanne ou copie cet invoice dans ton portefeuille Lightning pour régler le cours.</p>
          <textarea aria-label="Invoice Lightning" readOnly value={createdPayment.provider_payment_request} className="w-full min-h-24 rounded-md border border-line bg-body p-3 text-xs text-ink break-all" />
          <Button variant="secondary" icon={Copy} onClick={() => navigator.clipboard.writeText(createdPayment.provider_payment_request)}>Copier l’invoice</Button>
        </Card>
      )}
      {createdPayment?.provider === 'bitlibera' && createdPayment.status === 'PENDING' && (
        <Card className="p-5 text-sm text-ink-2">
          Paiement Bitlibera en attente de confirmation. Cette page vérifie automatiquement son statut.
        </Card>
      )}
      {createdPayment?.status === 'PAID' && <Card className="p-5 text-sm font-medium text-success">Paiement confirmé. Ton inscription au cours est activée.</Card>}

      {chapters.length > 0 && (
        <Card className="p-5 sm:p-7">
          <h2 className="text-lg font-semibold text-ink mb-4">Contenu du cours</h2>
          <div className="space-y-4">
            {chapters.map((ch, i) => (
              <div key={ch.id || i} className="rounded-lg border border-line">
                <div className="flex items-center gap-3 px-4 py-3 bg-body rounded-t-lg">
                  <span className="h-7 w-7 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <h3 className="font-semibold text-ink flex-1">{ch.title}</h3>
                  <span className="text-xs text-ink-3">{ch.lessons?.length || 0} leçons</span>
                </div>
                <ul className="divide-y divide-line">
                  {(ch.lessons || []).map((l) => (
                    <li key={l.id} className="px-5 py-2.5 flex items-center gap-2 text-sm text-ink-2">
                      <ChevronRight className="w-4 h-4 text-neutral-300" /> {l.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Payer pour s'inscrire"
        subtitle={c.title}
        size="sm"
      >
        {payment.error && <Alert.Error className="mb-4">{payment.error}</Alert.Error>}
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (paymentMethod === 'bitlibera' && !bitliberaOtpSent) {
              try {
                await paymentsService.requestBitliberaOtp({ phone: bitliberaPhone, amount: price })
                setBitliberaOtpSent(true)
                toast.success('Code OTP envoyé', 'Saisis le code reçu pour confirmer le paiement Bitlibera.')
              } catch (e) {
                toast.error('Demande OTP impossible', getError(e))
              }
              return
            }
            startPayment({
              payment_method: paymentMethod,
              bitlibera_phone: bitliberaPhone,
              bitlibera_otp: bitliberaOtp,
            })
          }}
        >
          <div className="rounded-md bg-body border border-line p-4 flex items-center justify-between">
            <span className="text-sm text-ink-2">Montant</span>
            <span className="font-bold text-ink">{price.toLocaleString('fr-FR')} BIF</span>
          </div>
          <Select label="Méthode de paiement" name="payment_method" value={paymentMethod} onChange={(e) => {
            setPaymentMethod(e.target.value)
            setBitliberaOtpSent(false)
            setBitliberaOtp('')
          }}>
            <option value="bitcoin">Bitcoin via Blink (Lightning)</option>
            <option value="bitlibera">Bitlibera (BIF)</option>
          </Select>
          {paymentMethod === 'bitlibera' && (
            <>
              <label className="block text-sm text-ink-2">
                Téléphone Bitlibera
                <input value={bitliberaPhone} onChange={(e) => setBitliberaPhone(e.target.value)} required className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink" placeholder="+257..." />
              </label>
              {bitliberaOtpSent && (
                <label className="block text-sm text-ink-2">
                  Code OTP
                  <input value={bitliberaOtp} onChange={(e) => setBitliberaOtp(e.target.value)} required className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink" inputMode="numeric" />
                </label>
              )}
            </>
          )}
          <Button type="submit" fullWidth loading={payment.loading} icon={CreditCard}>
            {paymentMethod === 'bitlibera' && !bitliberaOtpSent ? 'Recevoir le code OTP' : 'Initier le paiement'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
