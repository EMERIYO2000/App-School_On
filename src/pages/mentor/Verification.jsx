import { useEffect, useState } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { profileService } from "../../services/profile.service";
import { useAsyncAction } from "../../hooks/useFetch";
import { Alert, Badge, Button, Card, FieldShell, Input, Textarea } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { getError } from "../../services/api";

const statusLabels = {
  DRAFT: "À compléter",
  pending: "En attente de validation",
  approved: "Profil vérifié",
  rejected: "Candidature refusée",
};

export default function MentorVerificationPage() {
  const { toast } = useToast();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bio: "", skills: "", identity_card: null, diploma: null });

  useEffect(() => {
    profileService.getMentorApplication()
      .then(({ application: current }) => {
        setApplication(current);
        if (current) setForm((value) => ({ ...value, bio: current.bio || "", skills: current.skills || "" }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const status = application?.status || "DRAFT";
  const canApply = !["pending", "approved"].includes(status);
  const save = useAsyncAction(async () => {
    const payload = new FormData();
    payload.append("bio", form.bio.trim());
    payload.append("skills", form.skills.trim());
    if (form.identity_card) payload.append("identity_card", form.identity_card);
    if (form.diploma) payload.append("diploma", form.diploma);
    const saved = await profileService.saveMentorApplication(payload);
    setApplication(saved);
    return saved;
  });

  async function submit(event) {
    event.preventDefault();
    try {
      await save.run(event);
      toast.success("Candidature envoyée pour vérification");
    } catch (error) {
      toast.error(getError(error) || "Envoi impossible");
    }
  }

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Vérification de ton profil</h1>
        <p className="mt-1 text-sm text-ink-3">Soumets tes informations et tes justificatifs pour demander le statut mentor.</p>
      </div>
      <Card className="p-5 flex items-center gap-4">
        <span className={`h-12 w-12 rounded-full flex items-center justify-center ${status === "approved" ? "bg-success-light text-success" : "bg-warning-light text-warning"}`}>
          {status === "approved" ? <BadgeCheck className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
        </span>
        <div>
          <p className="font-semibold text-ink">Statut</p>
          <Badge tone={status === "approved" ? "success" : status === "rejected" ? "error" : "warning"}>
            {statusLabels[status] || status}
          </Badge>
        </div>
      </Card>
      {application?.review_note && <Alert.Error>{application.review_note}</Alert.Error>}
      {loading ? <Card className="p-6">Chargement de ta candidature…</Card> : canApply ? (
        <Card className="p-6">
          <form className="space-y-4" onSubmit={submit}>
            <FieldShell label="Présentation professionnelle" htmlFor="mentor-bio">
              <Textarea id="mentor-bio" rows={5} required minLength={30} value={form.bio} onChange={(e) => setForm((v) => ({ ...v, bio: e.target.value }))} />
            </FieldShell>
            <FieldShell label="Compétences et domaines enseignés" htmlFor="mentor-skills">
              <Textarea id="mentor-skills" rows={4} required minLength={5} value={form.skills} onChange={(e) => setForm((v) => ({ ...v, skills: e.target.value }))} placeholder="Ex. Mathématiques, algèbre, préparation examens" />
            </FieldShell>
            <FieldShell label="Carte d’identité" htmlFor="mentor-identity">
              <Input id="mentor-identity" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm((v) => ({ ...v, identity_card: e.target.files?.[0] || null }))} />
            </FieldShell>
            <FieldShell label="Diplôme ou certificat" htmlFor="mentor-diploma">
              <Input id="mentor-diploma" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setForm((v) => ({ ...v, diploma: e.target.files?.[0] || null }))} />
            </FieldShell>
            {save.error && <Alert.Error>{getError(save.error)}</Alert.Error>}
            <Button type="submit" loading={save.loading}>Envoyer ma candidature</Button>
          </form>
        </Card>
      ) : (
        <Card className="p-6 text-sm text-ink-2">
          {status === "approved" ? "Ton profil est vérifié. Tu peux créer des cours et proposer des sessions." : "Ta candidature a été envoyée. L’équipe SCHOOL ON la vérifie."}
        </Card>
      )}
    </div>
  );
}
