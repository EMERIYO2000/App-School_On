import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flag,
  XCircle,
} from "lucide-react";
import { coursesService } from "../../services/courses.service";
import { getError } from "../../services/api";
import { Badge, Button, ErrorState, PageLoader, ProgressBar } from "../ui";

const QUESTION_TOAST = {
  SINGLE_CHOICE: "Choisissez une réponse",
  MULTIPLE_CHOICE: "Sélectionnez une ou plusieurs réponses",
  TRUE_FALSE: "Vrai ou faux ?",
  NUMERIC: "Saisissez un nombre",
};

export default function QuizEngine({ quiz, onComplete, onExit }) {
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const q = quiz || {};
  const question = questions[index];
  const isLast = index === questions.length - 1;
  const progress = questions.length
    ? ((index + (isAnswered(question, answers) && !isLast ? 1 : 0)) /
        questions.length) *
      100
    : 0;

  function isAnswered(question, map) {
    if (!question) return false;
    const val = map[question.id];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && val !== "";
  }

  async function start() {
    setPhase("loading");
    try {
      const data = await coursesService.startQuiz(q.id);
      const attemptId = data.attempt_id || data.attempt?.id || data.id;
      const qs = data.questions || data.attempt?.questions || [];
      if (!qs.length)
        throw new Error("Ce quiz ne contient aucune question pour le moment.");
      setAttempt({ id: attemptId, ...(data.attempt || {}) });
      setQuestions(qs);
      setPhase("running");
    } catch (e) {
      setError(getError(e));
      setPhase("error");
    }
  }

  function toggle(question, value) {
    const type = (
      question.question_type ||
      question.type ||
      "SINGLE_CHOICE"
    ).toUpperCase();
    setAnswers((prev) => {
      if (type === "MULTIPLE_CHOICE") {
        const cur = Array.isArray(prev[question.id]) ? prev[question.id] : [];
        const next = cur.includes(value)
          ? cur.filter((v) => v !== value)
          : [...cur, value];
        return { ...prev, [question.id]: next };
      }
      return { ...prev, [question.id]: value };
    });
  }

  async function submit() {
    setSubmitting(true);
    try {
      const payload = { answers };
      if (attempt?.id) payload.attempt_id = attempt.id;
      const data = await coursesService.submitQuiz(q.id, payload);
      setResult(data);
      setPhase("done");
      onComplete?.(data);
    } catch (e) {
      setError(getError(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "error") return <ErrorState message={error} onRetry={start} />;

  if (phase === "loading")
    return (
      <div className="py-12">
        <PageLoader label="Préparation du quiz…" />
      </div>
    );

  if (phase === "done" && result)
    return (
      <QuizResultView
        quiz={q}
        result={result}
        questions={questions}
        answers={answers}
        onRestart={start}
        onExit={onExit}
        onBack={() => setPhase("running")}
      />
    );

  if (phase === "running" && question) {
    const type = (
      question.question_type ||
      question.type ||
      "SINGLE_CHOICE"
    ).toUpperCase();
    const currentVal = answers[question.id];
    return (
      <div className="max-w-2xl mx-auto animate-fade-in" key={question.id}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-ink-3">
            Question {index + 1} sur {questions.length}
          </span>
          <Badge tone={type === "MULTIPLE_CHOICE" ? "terracotta" : "blue"}>
            {type === "MULTIPLE_CHOICE"
              ? "Choix multiples"
              : type === "TRUE_FALSE"
                ? "Vrai / Faux"
                : type === "NUMERIC"
                  ? "Numérique"
                  : "Choix unique"}
          </Badge>
        </div>
        <ProgressBar value={progress} size="sm" />
        <div className="bg-surface rounded-lg border border-line shadow-1 p-6 sm:p-8 mt-5">
          <h2 className="text-lg sm:text-xl font-semibold text-ink leading-snug">
            {question.question || question.text}
          </h2>
          {question.explanation && (
            <p className="mt-2 text-sm text-ink-3">{question.explanation}</p>
          )}
          <div className="mt-6 space-y-2.5">
            {type === "NUMERIC" ? (
              <input
                type="number"
                inputMode="numeric"
                className="w-full rounded-md border border-line px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Votre réponse…"
                value={currentVal || ""}
                onChange={(e) =>
                  setAnswers((p) => ({ ...p, [question.id]: e.target.value }))
                }
              />
            ) : (
              (question.options || question.choices || []).map((opt, oi) => {
                const optValue =
                  typeof opt === "object"
                    ? (opt.id ?? opt.value ?? opt.choice)
                    : opt;
                const optLabel =
                  typeof opt === "object"
                    ? (opt.text ??
                      opt.label ??
                      opt.choice_text ??
                      String(optValue))
                    : opt;
                const isSelected = Array.isArray(currentVal)
                  ? currentVal.includes(optValue)
                  : currentVal === optValue;
                const letter = String.fromCharCode(65 + oi);
                return (
                  <button
                    key={oi}
                    onClick={() => toggle(question, optValue)}
                    className={`w-full flex items-center gap-3 rounded-md border-2 px-4 py-3.5 text-left text-sm sm:text-base transition-all ${
                      isSelected
                        ? "border-brand-blue bg-brand-blue-light text-brand-blue-dark"
                        : "border-line bg-surface text-ink-2 hover:border-line"
                    }`}
                  >
                    <span
                      className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-brand-blue text-white"
                          : "bg-surface-2 text-ink-3"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="flex-1">{optLabel}</span>
                    {(type === "TRUE_FALSE" ||
                      optLabel === "Vrai" ||
                      optLabel === "Faux") && (
                      <CheckCircle2
                        className={`w-5 h-5 ${isSelected ? "text-brand-blue" : "text-transparent"}`}
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                index === 0 ? onExit?.() : setIndex((i) => i - 1)
              }
              icon={ArrowLeft}
            >
              {index === 0 ? "Quitter le quiz" : "Précédent"}
            </Button>
            {isLast ? (
              <Button
                onClick={submit}
                loading={submitting}
                icon={Flag}
                disabled={!isAnswered(question, answers)}
              >
                Terminer le quiz
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={ArrowRight}
                disabled={!isAnswered(question, answers)}
                onClick={() => setIndex((i) => i + 1)}
              >
                Question suivante
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function QuizResultView({
  quiz,
  result,
  questions,
  answers,
  onRestart,
  onExit,
  onBack,
}) {
  const score = Number(result.score ?? 0);
  const passed = score >= Number(quiz.passing_score ?? quiz.min_score ?? 70);
  const details = result.details || [];
  const detailMap = useMemo(
    () => Object.fromEntries(details.map((d) => [String(d.question_id), d])),
    [details],
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-surface rounded-lg border border-line shadow-1 overflow-hidden">
        <div
          className={`px-6 py-8 sm:px-10 text-center ${passed ? "bg-success-light/50" : "bg-warning-light/50"}`}
        >
          <span
            className={`inline-flex h-16 w-16 rounded-full items-center justify-center ${passed ? "bg-success text-white" : "bg-warning text-white"}`}
          >
            {passed ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <XCircle className="w-8 h-8" />
            )}
          </span>
          <h2 className="mt-4 text-2xl font-bold text-ink">
            {passed ? "Quiz réussi !" : "Quiz terminé"}
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            {result.message ||
              (passed
                ? "Bien joué, continue sur ta lancée."
                : "Continue : la pratique rend meilleur.")}
          </p>
          <div className="mt-5 flex items-center justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-brand-blue">
                {score.toFixed(score % 1 ? 1 : 0)}%
              </p>
              <p className="text-xs text-ink-3 mt-1">Score</p>
            </div>
            {typeof result.xp_earned === "number" && (
              <div>
                <p className="text-3xl font-bold text-brand-terracotta">
                  +{result.xp_earned}
                </p>
                <p className="text-xs text-ink-3 mt-1">XP gagné</p>
              </div>
            )}
            <div>
              <p className="text-3xl font-bold text-ink">
                {details.filter((d) => d.is_correct).length || "—"}
              </p>
              <p className="text-xs text-ink-3 mt-1">Bonnes réponses</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 sm:px-10 space-y-4">
          {questions.map((q, i) => {
            const d = detailMap[String(q.id)];
            const type = (
              q.question_type ||
              q.type ||
              "SINGLE_CHOICE"
            ).toUpperCase();
            const correct =
              d?.is_correct !== undefined
                ? d.is_correct
                : type === "MULTIPLE_CHOICE"
                  ? Array.isArray(d?.correct) && false
                  : false;
            const answered = answers[q.id];
            return (
              <div key={q.id} className="rounded-md border border-line p-4">
                <div className="flex items-start gap-2.5">
                  {d?.is_correct === true ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : d?.is_correct === false ? (
                    <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-5 text-xs font-bold text-ink-3 mt-0.5">
                      {i + 1}.
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {q.question || q.text}
                    </p>
                    {!(d?.is_correct === false) &&
                      !Array.isArray(answered) &&
                      answered !== undefined && (
                        <p className="mt-1 text-xs text-ink-3">
                          Ta réponse :{" "}
                          <span className="font-medium text-ink-2">
                            {String(answered)}
                          </span>
                        </p>
                      )}
                    {d?.explanation && (
                      <p className="mt-1.5 text-xs text-ink-3">
                        {d.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button variant="outline" onClick={onRestart} className="sm:flex-1">
              Recommencer
            </Button>
            <Button variant="outline" onClick={onBack} className="sm:flex-1">
              Voir les questions
            </Button>
            <Button
              onClick={onExit}
              variant={passed ? "primary" : "terracotta"}
              className="sm:flex-1"
            >
              Terminer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
