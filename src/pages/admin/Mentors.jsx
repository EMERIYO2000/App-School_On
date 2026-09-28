import { useState } from "react";
import { Check, FileText, RefreshCw, ShieldCheck, X } from "lucide-react";
import { adminService } from "../../services/profile.service";
import { useFetch, useAsyncAction } from "../../hooks/useFetch";
import { getError } from "../../services/api";
import { Alert, Badge, Button, Card, Textarea } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";

export default function AdminMentorsPage() {
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const applications = useFetch(() => adminService.getMentorApplications({ status: "pending" }), []);
  const review = useAsyncAction(async (action) => {
    if (!selected) return;
    await adminService.reviewMentorApplication(selected.id, { action, note });
    setSelected(null);
    setNote("");
    await applications.refresh();
    toast?.success?.("Décision enregistrée");
  });
  const results = applications.data?.results || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Candidatures mentor</h1>
          <p className="mt-1 text-sm text-ink-3">Vérifie les dossiers avant d’accorder le statut mentor.</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={applications.refresh}>Actualiser</Button>
      </div>
      {applications.error && <Alert.Error>{getError(applications.error)}</Alert.Error>}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] gap-5 items-start">
        <div className="space-y-3">
          {results.map((application) => (
            <button key={application.id} onClick={() => { setSelected(application); setNote(application.review_note || ""); }} className="w-full text-left">
              <Card className={`p-4 hover:border-brand-blue transition-colors ${selected?.id === application.id ? "border-brand-blue" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{application.user_email || `Candidat #${application.id}`}</p>
                    <p className="mt-1 text-sm text-ink-3 line-clamp-2">{application.bio || "Présentation à vérifier"}</p>
                  </div>
                  <Badge tone="warning">{application.status}</Badge>
                </div>
              </Card>
            </button>
          ))}
          {!applications.loading && !results.length && <Card className="p-8 text-center text-sm text-ink-3">Aucune candidature en attente.</Card>}
          {applications.loading && <Card className="p-8 text-center text-sm text-ink-3">Chargement des candidatures…</Card>}
        </div>
        <Card className="p-5 lg:sticky lg:top-24">
          {!selected ? (
            <div className="py-8 text-center text-sm text-ink-3"><ShieldCheck className="mx-auto mb-3 h-8 w-8" />Sélectionne un dossier pour le consulter.</div>
          ) : (
            <div className="space-y-4">
              <div><h2 className="font-semibold text-ink">{selected.user_email}</h2><p className="text-sm text-ink-3">Candidature #{selected.id}</p></div>
              <p className="text-sm text-ink-2 whitespace-pre-wrap">{selected.bio}</p>
              <div className="space-y-2 text-sm"><p className="font-medium text-ink">Compétences</p><p className="text-ink-2 whitespace-pre-wrap">{selected.skills}</p></div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-ink">Justificatifs</p>
                {[["Carte d’identité", selected.identity_card], ["Diplôme", selected.diploma], ["Certificat", selected.certificates]].filter(([, url]) => url).map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-blue"><FileText className="h-4 w-4" />{label}</a>
                ))}
                {!selected.identity_card && !selected.diploma && !selected.certificates && <p className="text-ink-3">Aucun document joint.</p>}
              </div>
              <Textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Motif en cas de refus" />
              {review.error && <Alert.Error>{getError(review.error)}</Alert.Error>}
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" icon={Check} loading={review.loading} onClick={() => review.run("approve")}>Approuver</Button>
                <Button size="sm" variant="destructive" icon={X} loading={review.loading} onClick={() => review.run("reject")}>Refuser</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
