import { useState } from "react";
import { BookOpen, Check, FlaskConical, Award, X } from "lucide-react";
import { useAsyncAction, useFetch } from "../../hooks/useFetch";
import { coursesService, paginate } from "../../services/courses.service";
import { certificatesService } from "../../services/extras.service";
import { isNotFound } from "../../services/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageLoader,
  statusTone,
  Textarea,
} from "../../components/ui";

export default function AdminCoursesPage({ tab = "courses" }) {
  if (tab === "quizzes") return <QuizzesTab />;
  if (tab === "certificates") return <CertificatesTab />;
  return <CoursesTab />;
}

function CoursesTab() {
  const courses = useFetch(
    () => coursesService.getCourses({ page_size: 100 }).then(paginate),
    [],
  );
  const list = courses.data?.results || [];

  if (courses.loading) return <PageLoader label="Chargement des cours…" />;
  if (courses.error && !isNotFound(courses.error))
    return <ErrorState message={courses.error} onRetry={courses.refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Cours</h1>
        <p className="mt-1 text-sm text-ink-3">
          Modération et suivi des cours publiés sur la plateforme.
        </p>
      </div>
      {isNotFound(courses.error) ? (
        <EmptyState
          icon={BookOpen}
          title="Catalogue indisponible"
          description="L'endpoint de modération n'est pas encore exposé."
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours"
          description="Les cours de la communauté apparaîtront ici."
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-line">
            {list.map((c) => (
              <CourseModerationRow
                key={c.id}
                course={c}
                refresh={courses.refresh}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function CourseModerationRow({ course, refresh }) {
  const [note, setNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const action = useAsyncAction(async (type) => {
    if (type === "approve") await coursesService.approveCourse(course.id);
    else await coursesService.rejectCourse(course.id, note);
    setShowReject(false);
    setNote("");
    await refresh();
  });
  return (
    <li className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="h-11 w-11 rounded-full bg-brand-terracotta-light text-brand-terracotta-dark flex items-center justify-center shrink-0">
        <BookOpen className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{course.title}</p>
        <p className="text-xs text-ink-3 truncate">
          {course.category?.name || course.category || "Sans catégorie"} ·{" "}
          {course.level || "—"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone={statusTone(course.status)}>
          {course.status || "DRAFT"}
        </Badge>
        <span className="text-xs text-ink-3">
          {course.students_count ?? 0} apprenants
        </span>
      </div>
      {course.status === "SUBMITTED" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            icon={Check}
            loading={action.loading}
            onClick={() => action.run("approve")}
          >
            Publier
          </Button>
          <Button
            size="sm"
            variant="destructive"
            icon={X}
            loading={action.loading}
            onClick={() => setShowReject((value) => !value)}
          >
            Refuser
          </Button>
        </div>
      )}
      {showReject && (
        <div className="w-full sm:ml-14">
          <Textarea
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Motif du rejet (10 caractères minimum)"
          />
          <Button
            className="mt-2"
            size="sm"
            variant="destructive"
            disabled={note.trim().length < 10}
            loading={action.loading}
            onClick={() => action.run("reject")}
          >
            Confirmer le rejet
          </Button>
        </div>
      )}
    </li>
  );
}

function QuizzesTab() {
  const quizzes = useFetch(async () => {
    const data = await coursesService.getQuizzes({ page_size: 100 });
    return Array.isArray(data) ? data : data.results || [];
  }, []);
  const list = quizzes.data || [];

  if (quizzes.loading) return <PageLoader label="Chargement des quiz…" />;
  if (quizzes.error && !isNotFound(quizzes.error))
    return <ErrorState message={quizzes.error} onRetry={quizzes.refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Quiz</h1>
        <p className="mt-1 text-sm text-ink-3">
          Suivi des quiz et exercices disponibles.
        </p>
      </div>
      {isNotFound(quizzes.error) ? (
        <EmptyState
          icon={FlaskConical}
          title="Quiz indisponible"
          description="L'endpoint de modération des quiz n'est pas encore exposé."
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Aucun quiz"
          description="Les quiz apparaîtront ici une fois créés."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((q) => (
            <QuizModerationCard key={q.id} quiz={q} refresh={quizzes.refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizModerationCard({ quiz, refresh }) {
  const publish = useAsyncAction(async () => {
    await coursesService.publishQuiz(quiz.id);
    await refresh();
  });
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-ink">{quiz.title}</h3>
        <Badge tone={statusTone(quiz.status)}>{quiz.status || "DRAFT"}</Badge>
      </div>
      <p className="mt-1 text-sm text-ink-3">
        {quiz.course?.title || quiz.course || "Cours libre"}
      </p>
      <p className="mt-3 text-xs text-ink-3">
        {quiz.questions_count ?? 0} questions · {quiz.passing_score ?? 70}%
        requis
      </p>
      {quiz.status === "DRAFT" || quiz.status === "SUBMITTED" ? (
        <Button
          className="mt-4"
          size="sm"
          icon={Check}
          loading={publish.loading}
          onClick={() => publish.run()}
        >
          Publier
        </Button>
      ) : null}
    </Card>
  );
}

function CertificatesTab() {
  const certs = useFetch(async () => {
    const data = await certificatesService.getMyCertificates();
    return Array.isArray(data) ? data : data.results || [];
  }, []);
  const list = certs.data || [];

  if (certs.loading) return <PageLoader label="Chargement des certificats…" />;
  if (certs.error && !isNotFound(certs.error))
    return <ErrorState message={certs.error} onRetry={certs.refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">Certificats</h1>
        <p className="mt-1 text-sm text-ink-3">
          Certificats émis, révocables uniquement par l'équipe.
        </p>
      </div>
      <EmptyState
        icon={Award}
        title="Registre des certificats"
        description="Le registre global des certificats émis sera disponible avec l'endpoint admin dédié."
      />
    </div>
  );
}
