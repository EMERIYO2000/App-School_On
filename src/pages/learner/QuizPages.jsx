import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FlaskConical } from "lucide-react";
import { coursesService, paginate } from "../../services/courses.service";
import { useFetch } from "../../hooks/useFetch";
import QuizEngine from "../../components/business/QuizEngine";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  GridSkeleton,
} from "../../components/ui";

export function QuizListPage() {
  const [params] = useSearchParams();
  const courseId = params.get("course");
  const quizzes = useFetch(
    () =>
      coursesService
        .getQuizzes(courseId ? { course: courseId } : {})
        .then(paginate),
    [courseId],
  );
  const results = quizzes.data?.results || [];
  const label =
    results.find((q) => String(q.course_id) === String(courseId))
      ?.course_title || (courseId ? "Quiz du cours" : "Mes quiz");

  const toneByType = {
    COURSE: "blue",
    GAME: "terracotta",
    TRAINING: "info",
    EXAM_PREP: "warning",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ink">{label}</h1>
        <p className="mt-1 text-sm text-ink-3">
          Les résultats sont calculés et enregistrés côté serveur.
        </p>
      </div>

      {quizzes.loading && <GridSkeleton count={4} />}
      {!quizzes.loading && quizzes.error && (
        <ErrorState message={quizzes.error} onRetry={quizzes.refresh} />
      )}
      {!quizzes.loading && !quizzes.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={FlaskConical}
            title="Aucun quiz disponible"
            description="Les quiz de ce parcours n'ont pas encore été publiés."
          />
        </Card>
      )}

      {!quizzes.loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map((q) => {
            const type = String(
              q.quiz_type || q.type || "COURSE",
            ).toUpperCase();
            const questionsCount = q.questions_count ?? q.question_count ?? "—";
            return (
              <QuizCard
                key={q.id}
                quiz={q}
                type={type}
                questionsCount={questionsCount}
                tone={toneByType[type] || "blue"}
                params={params}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuizCard({ quiz, type, questionsCount, tone, params }) {
  const navigate = useNavigate();
  const labels = {
    COURSE: "Cours",
    GAME: "Jeu",
    TRAINING: "Entraînement",
    EXAM_PREP: "Prépa examen",
  };
  return (
    <div className="bg-surface rounded-lg border border-line shadow-1 p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <Badge tone={tone}>{labels[type] || type}</Badge>
        {quiz.time_limit && (
          <span className="text-xs text-ink-3">
            {quiz.time_limit} min
          </span>
        )}
      </div>
      <h3 className="mt-3 font-semibold text-ink line-clamp-1">
        {quiz.title}
      </h3>
      <p className="mt-1 text-sm text-ink-3 line-clamp-2 flex-1">
        {quiz.description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-ink-3">
          {questionsCount} questions
        </span>
        <Button
          size="sm"
          onClick={() =>
            navigate(`/quiz/${quiz.id}${params.toString() ? `?${params}` : ""}`)
          }
        >
          Passer le quiz
        </Button>
      </div>
    </div>
  );
}

export function QuizPlayerPage() {
  const { quizId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const quiz = useFetch(
    () =>
      coursesService
        .getQuizzes({ id: quizId })
        .then(paginate)
        .then((p) => p.results?.[0]),
    [quizId],
  );

  if (quiz.loading) return <GridSkeleton count={1} />;
  if (quiz.error || !quiz.data)
    return (
      <ErrorState
        title="Quiz introuvable"
        message={quiz.error || "Ce quiz n'existe pas."}
        onRetry={quiz.refresh}
      />
    );

  return (
    <div className="py-4 animate-fade-in">
      <QuizEngine
        quiz={quiz.data}
        onExit={() =>
          navigate(
            params.get("course")
              ? `/learning/${params.get("course")}`
              : "/quiz",
          )
        }
      />
    </div>
  );
}

export default function QuizPage() {
  return <QuizListPage />;
}
