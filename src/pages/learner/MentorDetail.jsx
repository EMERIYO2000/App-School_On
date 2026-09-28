import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Award,
  CalendarDays,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Users,
} from "lucide-react";
import { usersService } from "../../services/profile.service";
import { paymentsService } from "../../services/payments.service";
import { useFetch } from "../../hooks/useFetch";
import { getError } from "../../services/api";
import { getAvatar, getFullName } from "../../lib/format";
import { useToast } from "../../components/ui/Toast";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Modal,
  Select,
  Input,
  Textarea,
  Alert,
} from "../../components/ui";

export default function MentorDetailPage() {
  const { mentorId } = useParams();
  const toast = useToast?.();
  const [bookOpen, setBookOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const mentor = useFetch(() => usersService.getMentor(mentorId), [mentorId]);

  const m = mentor.data || {};
  const verified = m.is_verified || m.verification_status === "VERIFIED";
  const rating = Number(m.rating ?? m.average_rating ?? 0);
  const subjects = Array.isArray(m.subjects) ? m.subjects : m.skills || [];
  const reviews = Array.isArray(m.reviews) ? m.reviews : [];
  const about = m.bio || m.about || m.description || "";

  async function createBooking(e) {
    e.preventDefault();
    setSubmitting(true);
    setBookingError("");
    const fd = new FormData(e.currentTarget);
    try {
      await paymentsService.createBooking({
        mentor: Number(mentorId),
        scheduled_at: fd.get("scheduled_at"),
        duration: Number(fd.get("duration") || 60),
        subject: fd.get("subject"),
        notes: fd.get("notes"),
        mode: fd.get("mode"),
      });
      setBookOpen(false);
      toast?.success?.(
        "Demande envoyée",
        "Ton mentor sera notifié. Suis l’état dans tes sessions.",
      );
    } catch (err) {
      setBookingError(getError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (mentor.loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-4">
        <div className="h-40 bg-surface-2 rounded-lg animate-pulse" />
        <div className="h-24 bg-surface-2 rounded-lg animate-pulse" />
      </div>
    );
  }
  if (mentor.error || !m.id)
    return (
      <div className="max-w-4xl mx-auto py-10">
        <ErrorState
          message={
            mentor.error ||
            "Ce mentor n'est pas disponible dans les résultats proches."
          }
          onRetry={mentor.refresh}
        />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={getAvatar(m)}
            alt={getFullName(m)}
            className="h-24 w-24 rounded-full object-cover bg-surface-2"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{getFullName(m)}</h1>
              {verified && (
                <Badge tone="success" className="ml-1">
                  <Award className="w-3 h-3" /> Mentor vérifié
                </Badge>
              )}
            </div>
            <p className="mt-1 text-ink-2">
              {m.headline || m.tagline || m.profession || "Mentor"}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-3">
              {rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-warning" />{" "}
                  {rating.toFixed(1)}
                </span>
              )}
              {(typeof m.session_price === "number" ||
                typeof m.hourly_rate === "number") && (
                <span className="inline-flex items-center gap-1 font-medium text-ink-2">
                  {format(m.session_price ?? m.hourly_rate)} BIF
                </span>
              )}
              {m.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {m.city}
                </span>
              )}
              {(m.online || m.remote) && <Badge tone="info">En ligne</Badge>}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setBookOpen(true)} icon={CalendarDays}>
                Réserver une session
              </Button>
              <Button
                variant="outline"
                icon={MessageCircle}
                onClick={() => (window.location.href = `/community`)}
              >
                Poser une question
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-ink">À propos</h2>
          <p className="mt-3 text-sm text-ink-2 leading-relaxed">
            {about ||
              "Ce mentor présente son parcours ici. L’adresse exacte reste privée pour sa sécurité."}
          </p>
          {subjects.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium text-ink-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-ink-3" /> Domaines
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map((s, i) => (
                  <Badge key={i} tone="blue" className="px-3 py-1">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {m.experience && (
            <p className="mt-5 text-sm text-ink-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-ink-3" /> {m.experience}
            </p>
          )}
        </Card>

        {reviews.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold text-ink">
              Avis issus de sessions réelles
            </h2>
            <div className="mt-4 space-y-4">
              {reviews.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  className="border-b border-line pb-3 last:border-0"
                >
                  <div className="flex items-center gap-1 text-warning text-sm">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s < (r.rating || 0) ? "fill-warning" : "opacity-20"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-ink-2">{r.comment}</p>
                  <p className="mt-1 text-xs text-ink-3">
                    {r.author_name || "Apprenant"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Modal
        open={bookOpen}
        onClose={() => setBookOpen(false)}
        title="Réserver une session"
        subtitle={getFullName(m)}
        size="md"
      >
        {bookingError && (
          <Alert.Error className="mb-4">{bookingError}</Alert.Error>
        )}
        <form onSubmit={createBooking} className="space-y-4">
          <Select
            label="Mode de session"
            name="mode"
            defaultValue="online"
            required
          >
            <option value="online">En ligne (vidéo)</option>
            <option value="home">À domicile</option>
            <option value="venue">Lieu public convenu</option>
          </Select>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="block text-sm font-medium text-ink-2"
                htmlFor="sched"
              >
                Date & heure <span className="text-error">*</span>
              </label>
              <input
                id="sched"
                name="scheduled_at"
                type="datetime-local"
                required
                min={new Date(Date.now() + 3_600_000)
                  .toISOString()
                  .slice(0, 16)}
                className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <Select label="Durée (min)" name="duration" defaultValue="60">
              <option value="30">30 min</option>
              <option value="60">1 heure</option>
              <option value="90">1 h 30</option>
              <option value="120">2 heures</option>
            </Select>
          </div>
          <Input
            label="Sujet de la session"
            name="subject"
            placeholder="ex. Algèbre — chapitre 4"
            required
          />
          <Textarea
            label="Message pour le mentor"
            name="notes"
            placeholder="Décris ta difficulté pour qu'il puisse préparer…"
            rows={3}
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitting}
            icon={CalendarDays}
          >
            Envoyer la demande
          </Button>
        </form>
      </Modal>
    </div>
  );

  function format(v) {
    const n = Number(v);
    return n.toLocaleString("fr-FR");
  }
}

function normalize(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.tutors)) return data.tutors;
  return [];
}
