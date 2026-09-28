import { useState } from "react";
import {
  Archive,
  Check,
  FileText,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { coursesService, paginate } from "../../services/courses.service";
import { useAsyncAction, useFetch } from "../../hooks/useFetch";
import { getError } from "../../services/api";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageLoader,
  Textarea,
  statusTone,
} from "../../components/ui";
import { useToast } from "../../components/ui/Toast";

export default function AdminExamsPage() {
  const [tab, setTab] = useState("exams");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const toast = useToast();
  const exams = useFetch(
    () => coursesService.getExams({ page_size: 100 }).then(paginate),
    [],
  );
  const resources = useFetch(
    () => coursesService.getArchiveResources({ page_size: 100 }).then(paginate),
    [],
  );
  const current = tab === "exams" ? exams : resources;
  const list = current.data?.results || [];
  const decide = useAsyncAction(async (action) => {
    if (!selected) return;
    if (tab === "exams") {
      if (action === "approve") await coursesService.approveExam(selected.id);
      else await coursesService.rejectExam(selected.id, note);
    } else if (action === "approve")
      await coursesService.approveArchiveResource(selected.id);
    else await coursesService.rejectArchiveResource(selected.id, note);
    await current.refresh();
    setSelected(null);
    setNote("");
    toast?.success?.("Publication mise à jour");
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Examens et archives</h1>
          <p className="mt-1 text-sm text-ink-3">
            Contrôle les ressources avant leur publication sur la plateforme.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={current.refresh}
        >
          Actualiser
        </Button>
      </div>
      <div className="flex gap-2 border-b border-line">
        <button
          onClick={() => {
            setTab("exams");
            setSelected(null);
          }}
          className={`px-3 py-2 text-sm font-medium border-b-2 ${tab === "exams" ? "border-brand-blue text-brand-blue" : "border-transparent text-ink-3"}`}
        >
          Examens d’État
        </button>
        <button
          onClick={() => {
            setTab("archives");
            setSelected(null);
          }}
          className={`px-3 py-2 text-sm font-medium border-b-2 ${tab === "archives" ? "border-brand-blue text-brand-blue" : "border-transparent text-ink-3"}`}
        >
          Archives
        </button>
      </div>
      {current.loading && <PageLoader label="Chargement des publications…" />}
      {current.error && <Alert.Error>{getError(current.error)}</Alert.Error>}
      {!current.loading && !current.error && !list.length && (
        <Card>
          <EmptyState
            icon={Archive}
            title="Aucune publication"
            description="Les examens et archives soumis apparaîtront ici."
          />
        </Card>
      )}
      {!current.loading && !!list.length && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)] gap-5 items-start">
          <div className="space-y-3">
            {list.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setNote(item.review_note || "");
                }}
                className="w-full text-left"
              >
                <Card
                  className={`p-4 hover:border-brand-blue ${selected?.id === item.id ? "border-brand-blue" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="h-10 w-10 rounded-md bg-brand-blue-light text-brand-blue-dark flex items-center justify-center shrink-0">
                      {tab === "exams" ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink truncate">
                        {item.title || item.description || "Archive sans titre"}
                      </p>
                      <p className="mt-1 text-xs text-ink-3">
                        {tab === "exams"
                          ? `${item.subject || "Matière non renseignée"} · ${item.year || "Année inconnue"}`
                          : `Examen #${item.exam}`}
                      </p>
                    </div>
                    <Badge tone={statusTone(item.status || "DRAFT")}>
                      {item.status || "DRAFT"}
                    </Badge>
                  </div>
                </Card>
              </button>
            ))}
          </div>
          <Card className="p-5 lg:sticky lg:top-24">
            {!selected ? (
              <div className="py-8 text-center text-sm text-ink-3">
                Sélectionne une publication à examiner.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="font-semibold text-ink">
                    {selected.title || "Archive"}
                  </h2>
                  <p className="mt-1 text-sm text-ink-3">
                    {selected.subject ||
                      selected.resource_type ||
                      "Ressource pédagogique"}
                  </p>
                </div>
                {selected.review_note && (
                  <Alert.Warning>{selected.review_note}</Alert.Warning>
                )}
                {tab === "exams" && (
                  <div className="text-sm text-ink-2 space-y-1">
                    <p>{selected.questions?.length || 0} questions</p>
                    <p>{selected.resources?.length || 0} ressources liées</p>
                  </div>
                )}
                {tab === "archives" && selected.download_url && (
                  <a
                    href={selected.download_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-brand-blue"
                  >
                    <FileText className="w-4 h-4" /> Ouvrir le document
                  </a>
                )}
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Motif si la publication doit être corrigée"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    icon={Check}
                    loading={decide.loading}
                    onClick={() => decide.run("approve")}
                  >
                    Publier
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    icon={X}
                    loading={decide.loading}
                    onClick={() => decide.run("reject")}
                  >
                    Demander correction
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
