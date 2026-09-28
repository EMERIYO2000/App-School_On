import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  FlaskConical,
  List,
  PlayCircle,
} from "lucide-react";
import { coursesService, paginate } from "../../services/courses.service";
import { useFetch } from "../../hooks/useFetch";
import { getError } from "../../services/api";
import {
  Button,
  Card,
  ErrorState,
  PageLoader,
  ProgressBar,
  Badge,
} from "../../components/ui";
import { useToast } from "../../components/ui/Toast";

export default function CourseLearnPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast?.() || {};
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [listOpen, setListOpen] = useState(false);
  const [completed, setCompleted] = useState({});
  const [marking, setMarking] = useState(false);

  const course = useFetch(() => coursesService.getCourse(courseId), [courseId]);
  const lessons = useFetch(
    () =>
      coursesService
        .getLessons({ course: courseId })
        .then(paginate)
        .then((p) => p.results || []),
    [courseId],
  );
  const quizzes = useFetch(
    () =>
      coursesService
        .getQuizzes({ course: courseId })
        .then(paginate)
        .then((p) => p.results || []),
    [courseId],
  );

  const c = course.data || {};
  const lessonList = lessons.data || [];
  const quizList = quizzes.data || [];
  const chapterList = c.chapters || [];
  const contentBlocks = chapterList.flatMap(
    (chapter) => chapter.content_blocks || [],
  );

  const groupedLessons = useMemo(() => {
    const chapterMap = {};
    lessonList.forEach((l) => {
      const ch = l.chapter_id || l.chapter || l.chapter_title || "Chapitre 1";
      const key = typeof ch === "object" ? ch.id : ch;
      const label = typeof ch === "object" ? ch.title : l.chapter_title || key;
      if (!chapterMap[key])
        chapterMap[key] = { id: key, title: label, lessons: [] };
      chapterMap[key].lessons.push(l);
    });
    if (!Object.keys(chapterMap).length && lessonList.length) {
      return [{ id: "all", title: "Chapitres", lessons: lessonList }];
    }
    return Object.values(chapterMap);
  }, [lessonList]);

  const allLessons = lessonList;
  const activeLesson =
    lessonList.find((l) => l.id === activeLessonId) || lessonList[0] || null;
  const activeContentBlocks = activeLesson?.chapter
    ? contentBlocks.filter(
        (block) => String(block.chapter) === String(activeLesson.chapter),
      )
    : contentBlocks;

  useEffect(() => {
    if (!activeLessonId && lessonList.length)
      setActiveLessonId(lessonList[0].id);
  }, [lessonList, activeLessonId]);

  useEffect(() => {
    const init = {}(lessonList || []).forEach((l) => {
      if (l.is_completed || l.completed) init[l.id] = true;
    });
    setCompleted(init);
  }, [lessonList.length]);

  const progress = allLessons.length
    ? (Object.values(completed).filter(Boolean).length / allLessons.length) *
      100
    : 0;

  async function markDone() {
    if (!activeLesson?.id) return;
    setMarking(true);
    try {
      await coursesService.markLessonCompleted(activeLesson.id);
      setCompleted((prev) => ({ ...prev, [activeLesson.id]: true }));
      toast?.success?.("Leçon terminée", "Bien joué, continue !");
      const idx = allLessons.findIndex((l) => l.id === activeLesson.id);
      if (idx < allLessons.length - 1)
        setActiveLessonId(allLessons[idx + 1].id);
    } catch (e) {
      toast?.error?.("Impossible de terminer", getError(e));
    } finally {
      setMarking(false);
    }
  }

  if (course.loading)
    return <PageLoader label="Ouverture de la session de cours…" />;
  if (course.error)
    return <ErrorState message={course.error} onRetry={course.refresh} />;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to="/learning"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-brand-blue"
        >
          <ArrowLeft className="w-4 h-4" /> Mes cours
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="text-sm text-ink-2 line-clamp-1">{c.title}</span>
      </div>

      <div className="lg:hidden">
        <Button
          variant="outline"
          fullWidth
          onClick={() => setListOpen((o) => !o)}
          icon={List}
        >
          {listOpen ? "Fermer le plan du cours" : "Plan du cours"}
        </Button>
        {listOpen && (
          <Card className="mt-3 animate-fade-in">
            <LessonSidebar
              groupedLessons={groupedLessons}
              quizList={quizList}
              activeLessonId={activeLesson?.id}
              completed={completed}
              onSelect={(id) => {
                setActiveLessonId(id);
                setListOpen(false);
              }}
            />
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        <aside className="hidden lg:block sticky top-24">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-line">
              <p className="text-sm font-semibold text-ink">{c.title}</p>
              <div className="mt-2 flex items-center gap-3">
                <ProgressBar value={progress} size="sm" className="flex-1" />
                <span className="text-xs font-medium text-ink-2 shrink-0">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <LessonSidebar
              groupedLessons={groupedLessons}
              quizList={quizList}
              activeLessonId={activeLesson?.id}
              completed={completed}
              onSelect={setActiveLessonId}
            />
          </Card>
        </aside>

        <div className="min-w-0">
          {activeLesson ? (
            <Card className="overflow-hidden">
              <div className="px-5 sm:px-8 py-6 border-b border-line flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-brand-terracotta-dark uppercase tracking-wide">
                    Leçon
                  </p>
                  <h1 className="mt-0.5 text-xl sm:text-2xl font-bold text-ink">
                    {activeLesson.title}
                  </h1>
                </div>
                {completed[activeLesson.id] ? (
                  <Badge tone="success">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terminée
                  </Badge>
                ) : (
                  <Badge tone="neutral">À faire</Badge>
                )}
              </div>
              <div className="px-5 sm:px-8 py-8">
                <div className="prose prose-neutral max-w-none text-ink-2 leading-relaxed whitespace-pre-wrap">
                  {activeLesson.content ||
                    activeLesson.body ||
                    activeLesson.description || (
                      <p className="text-ink-3">
                        Le contenu de cette leçon sera disponible dès que le
                        backend sera relié. Tu peux déjà la marquer comme
                        terminée.
                      </p>
                    )}
                </div>
                {activeLesson.duration && (
                  <p className="mt-4 text-xs text-ink-3 inline-flex items-center gap-1.5">
                    <PlayCircle className="w-4 h-4" /> Durée estimée :{" "}
                    {activeLesson.duration}
                  </p>
                )}
                {activeContentBlocks.length > 0 && (
                  <div className="mt-8 space-y-5 border-t border-line pt-6">
                    {activeContentBlocks.map((block) => (
                      <ContentBlockView key={block.id} block={block} />
                    ))}
                  </div>
                )}
              </div>
              <div className="px-5 sm:px-8 py-5 border-t border-line flex items-center justify-between gap-3 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeLessonId === allLessons[0]?.id}
                  onClick={() => {
                    const idx = allLessons.findIndex(
                      (l) => l.id === activeLesson.id,
                    );
                    if (idx > 0) setActiveLessonId(allLessons[idx - 1].id);
                  }}
                  icon={ArrowLeft}
                >
                  Précédent
                </Button>
                <Button
                  size="sm"
                  loading={marking}
                  onClick={markDone}
                  icon={completed[activeLesson.id] ? CheckCircle2 : Circle}
                >
                  {completed[activeLesson.id]
                    ? "Terminée ✓"
                    : "Marquer comme terminée"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    activeLessonId === allLessons[allLessons.length - 1]?.id
                  }
                  onClick={() => {
                    const idx = allLessons.findIndex(
                      (l) => l.id === activeLesson.id,
                    );
                    if (idx < allLessons.length - 1)
                      setActiveLessonId(allLessons[idx + 1].id);
                  }}
                  icon={ArrowRight}
                >
                  Suivant
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-10 text-center text-ink-3 text-sm">
              {contentBlocks.length ? (
                <div className="text-left space-y-5">
                  <h1 className="text-xl font-bold text-ink">
                    Contenu du cours
                  </h1>
                  {contentBlocks.map((block) => (
                    <ContentBlockView key={block.id} block={block} />
                  ))}
                </div>
              ) : (
                "Aucune leçon publiée pour l'instant."
              )}
            </Card>
          )}

          {quizList.length > 0 && (
            <Card className="mt-6 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="h-11 w-11 rounded-full bg-brand-terracotta-light text-brand-terracotta-dark flex items-center justify-center shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">Quiz du cours</h3>
                  <p className="text-sm text-ink-3">
                    Teste tes connaissances en fin de parcours.
                  </p>
                </div>
              </div>
              <Link to={`/quiz/${quizList[0].id}?course=${c.id}`}>
                <Button variant="terracotta" icon={FlaskConical}>
                  Passer le quiz
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentBlockView({ block }) {
  const source = block.file_url || block.url;
  if (block.content_type === "IMAGE" && source) {
    return (
      <figure>
        <img
          src={source}
          alt={block.caption || block.title}
          className="max-h-96 w-full object-contain rounded-md bg-surface-2"
        />
        <figcaption className="mt-2 text-xs text-ink-3">
          {block.caption || block.title}
        </figcaption>
      </figure>
    );
  }
  if (block.content_type === "VIDEO" && source) {
    return (
      <div>
        <h3 className="font-semibold text-ink">{block.title}</h3>
        <video controls src={source} className="mt-2 w-full rounded-md" />
      </div>
    );
  }
  if (block.content_type === "DOCUMENT" && source) {
    return (
      <a
        href={source}
        target="_blank"
        rel="noreferrer"
        className="block rounded-md border border-line p-4 text-sm font-medium text-brand-blue hover:bg-brand-blue-light"
      >
        {block.title || "Ouvrir le document"}
      </a>
    );
  }
  if (block.content_type === "RESOURCE" && source) {
    return (
      <a
        href={source}
        target="_blank"
        rel="noreferrer"
        className="block rounded-md border border-line p-4 text-sm font-medium text-brand-blue hover:bg-brand-blue-light"
      >
        {block.title || source}
      </a>
    );
  }
  return (
    <section>
      <h3 className="font-semibold text-ink">{block.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-ink-2 leading-relaxed">
        {block.text_content}
      </p>
    </section>
  );
}

function LessonSidebar({
  groupedLessons,
  quizList,
  activeLessonId,
  completed,
  onSelect,
}) {
  return (
    <div className="max-h-[60vh] lg:max-h-[calc(100vh-200px)] overflow-y-auto p-2">
      {groupedLessons.map((group) => (
        <div key={group.id} className="mb-2">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
            {group.title}
          </p>
          <ul className="space-y-0.5">
            {group.lessons.map((l, i) => {
              const done = completed[l.id];
              const active = l.id === activeLessonId;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => onSelect(l.id)}
                    className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-brand-blue-light text-brand-blue-dark"
                        : "text-ink-2 hover:bg-surface-2"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <span className="w-4 h-4 shrink-0 rounded-full border-2 border-line text-[10px] flex items-center justify-center text-ink-3">
                        {i + 1}
                      </span>
                    )}
                    <span className="truncate flex-1">{l.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {quizList.length > 0 && (
        <div className="mt-2 border-t border-line pt-2">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
            Evaluations
          </p>
          {quizList.map((q) => (
            <Link
              key={q.id}
              to={`/quiz/${q.id}`}
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-brand-terracotta-dark hover:bg-brand-terracotta-light/40"
            >
              <FlaskConical className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{q.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
