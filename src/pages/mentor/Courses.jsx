import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { BookOpen, PenLine, Plus, Star } from "lucide-react";
import { coursesService } from "../../services/courses.service";
import { useFetch } from "../../hooks/useFetch";
import {
  Badge,
  Alert,
  Button,
  Card,
  EmptyState,
  ErrorState,
  GridSkeleton,
  Input,
  Select,
  Textarea,
} from "../../components/ui";

export function MentorCoursesPage() {
  const courses = useFetch(
    () => coursesService.getMyCourses().then(normalize),
    [],
  );
  const results = courses.data || [];
  const active = results.filter(
    (c) =>
      !["ARCHIVED", "DRAFT"].includes(String(c.status || "").toUpperCase()),
  );
  const draft = results.filter((c) =>
    ["DRAFT", "REVIEW", "SUBMITTED"].includes(
      String(c.status || "").toUpperCase(),
    ),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Mes cours</h1>
          <p className="mt-1 text-sm text-ink-3">
            Crée, gère et suis tes contenus.
          </p>
        </div>
        <Link to="/mentor/courses/create">
          <Button icon={PenLine}>Créer un cours</Button>
        </Link>
      </div>

      {courses.loading && <GridSkeleton count={4} />}
      {!courses.loading && courses.error && (
        <ErrorState message={courses.error} onRetry={courses.refresh} />
      )}
      {!courses.loading && !courses.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Aucun cours"
            description="Crée ton premier cours pour commencer à enseigner."
            action={
              <Link to="/mentor/courses/create">
                <Button icon={PenLine}>Créer un cours</Button>
              </Link>
            }
          />
        </Card>
      )}
      {results.length > 0 && (
        <div className="space-y-8">
          <Section title="Cours actifs" courses={active} />
          <Section title="Brouillons & en révision" courses={draft} />
        </div>
      )}
    </div>
  );
}

function Section({ title, courses }) {
  if (!courses.length) return null;
  return (
    <div>
      <h2 className="text-sm font-semibold text-ink-3 uppercase tracking-wide mb-3">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c) => (
          <Card key={c.id} className="p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink line-clamp-1 flex-1">
                {c.title}
              </h3>
              <Badge
                tone={
                  String(c.status || "DRAFT").toUpperCase() === "PUBLISHED"
                    ? "success"
                    : "warning"
                }
              >
                {c.status}
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-ink-3 line-clamp-2 flex-1">
              {c.short_description || c.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-ink-3">
              <span>{c.students_count ?? 0} apprenants</span>
              <span>
                {c.progress_pct !== undefined
                  ? `${Math.round(c.progress_pct)}%`
                  : c.lessons_count
                    ? `${c.lessons_count} leçons`
                    : ""}
              </span>
              <Link
                to={`/mentor/courses/${c.id}`}
                className="text-sm font-medium text-brand-blue hover:underline"
              >
                Gérer
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MentorCourseDetailPage() {
  const { id } = useParams();
  const course = useFetch(() => coursesService.getCourse(id), [id]);
  const reviews = useFetch(() => coursesService.getCourseReviews(id), [id]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("");
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizChoiceA, setQuizChoiceA] = useState("");
  const [quizChoiceB, setQuizChoiceB] = useState("");
  const [quizCorrectChoice, setQuizCorrectChoice] = useState("A");
  const [chapterTitle, setChapterTitle] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonText, setLessonText] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [builderError, setBuilderError] = useState("");
  const [saving, setSaving] = useState(false);
  const c = course.data || {};
  const categories = useFetch(
    () => coursesService.getCategories().then((data) => Array.isArray(data) ? data : data?.results || []),
    [],
  );
  const quizCategories = Array.isArray(categories.data) ? categories.data : [];
  const reviewData = reviews.data || { results: [], count: 0, average_rating: 0 };

  async function addChapter(event) {
    event.preventDefault();
    setSaving(true);
    setBuilderError("");
    try {
      const created = await coursesService.createChapter({
        course: Number(id),
        category: quizCategory ? Number(quizCategory) : undefined,
        title: chapterTitle.trim(),
      });
      setChapterTitle("");
      setSelectedChapter(String(created.id));
      await course.run();
    } catch (error) {
      setBuilderError(error?.response?.data?.detail || "Impossible de créer le chapitre.");
    } finally {
      setSaving(false);
    }
  }

  async function addLesson(event) {
    event.preventDefault();
    setSaving(true);
    setBuilderError("");
    try {
      await coursesService.createLesson({
        course: Number(id),
        chapter: Number(selectedChapter || c.chapters?.[0]?.id),
        title: lessonTitle.trim(),
        content_type: "TEXT",
        text_content: lessonText.trim(),
      });
      setLessonTitle("");
      setLessonText("");
      await course.run();
    } catch (error) {
      setBuilderError(error?.response?.data?.detail || "Impossible d’ajouter la leçon.");
    } finally {
      setSaving(false);
    }
  }

  async function submitCourse() {
    setSaving(true);
    setBuilderError("");
    try {
      await coursesService.submitCourse(id);
      await course.run();
    } catch (error) {
      const rules = error?.response?.data?.rules;
      setBuilderError(Array.isArray(rules) ? rules.join(" ") : error?.response?.data?.detail || "Impossible de soumettre le cours.");
    } finally {
      setSaving(false);
    }
  }

  async function createQuiz(event) {
    event.preventDefault();
    setSaving(true);
    setBuilderError("");
    try {
      await coursesService.createQuiz({
        course: Number(id),
        title: quizTitle.trim(),
        description: "Quiz de validation du cours.",
        quiz_type: "TRAINING",
        questions: [{
          text: quizQuestion.trim(),
          question_type: "SINGLE_CHOICE",
          points: 1,
          order: 1,
          choices: [
            { text: quizChoiceA.trim(), is_correct: quizCorrectChoice === "A" },
            { text: quizChoiceB.trim(), is_correct: quizCorrectChoice === "B" },
          ],
        }],
      });
      setQuizTitle("");
      setQuizCategory("");
      setQuizQuestion("");
      setQuizChoiceA("");
      setQuizChoiceB("");
      setQuizCorrectChoice("A");
      setQuizOpen(false);
      await course.run();
    } catch (error) {
      setBuilderError(error?.response?.data?.detail || "Impossible de créer le quiz.");
    } finally {
      setSaving(false);
    }
  }

  if (course.loading) return <GridSkeleton count={2} />;
  if (course.error)
    return <ErrorState message={course.error} onRetry={course.refresh} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/mentor/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-brand-blue"
      >
        ← Mes cours
      </Link>
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{c.title}</h1>
              <Badge
                tone={
                  String(c.status || "").toUpperCase() === "PUBLISHED"
                    ? "success"
                    : "warning"
                }
              >
                {c.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-ink-2 whitespace-pre-line">
              {c.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-3">
              <span>{c.category_name || c.category?.name || c.category || ""}</span>
              <span>{c.level || ""}</span>
              <span>{c.students_count ?? 0} apprenants</span>
              {Number(c.price ?? 0) > 0 && (
                <span>{Number(c.price).toLocaleString("fr-FR")} BIF</span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:w-56 shrink-0">
            <Button
              variant="outline"
              icon={PenLine}
              onClick={() => setBuilderOpen((open) => !open)}
            >
              {builderOpen ? "Fermer le gestionnaire" : "Gérer les leçons"}
            </Button>
            <Button variant="outline" icon={Plus} onClick={() => setQuizOpen((open) => !open)}>
              {quizOpen ? "Fermer le quiz" : "Créer un quiz"}
            </Button>
          </div>
        </div>
      </Card>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Publication du cours</h2>
              <p className="mt-1 text-sm text-ink-3">Ajoute au moins un chapitre et une leçon ou un quiz, puis soumets le cours à la validation.</p>
            </div>
            <Badge tone={String(c.status || '').toUpperCase() === 'PUBLISHED' ? 'success' : 'warning'}>{c.status || 'DRAFT'}</Badge>
          </div>
          {c.review_note && <Alert.Info title="Retour de modération">{c.review_note}</Alert.Info>}
          {['DRAFT', 'REVIEW'].includes(String(c.status || '').toUpperCase()) && (
            <Button onClick={submitCourse} loading={saving}>Soumettre pour validation</Button>
          )}
          {String(c.status || '').toUpperCase() === 'SUBMITTED' && <p className="text-sm text-ink-2">Le cours est en attente de validation par l’administration.</p>}
          {String(c.status || '').toUpperCase() === 'PUBLISHED' && <p className="text-sm text-success">Le cours est visible par les apprenants sur le catalogue.</p>}
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-ink">Feedbacks des apprenants</h2>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-warning"><Star className="w-4 h-4 fill-warning" /> {Number(reviewData.average_rating || 0).toFixed(1)} ({reviewData.count || 0})</span>
          </div>
          {reviews.loading && <p className="mt-4 text-sm text-ink-3">Chargement des feedbacks…</p>}
          {!reviews.loading && reviews.error && <Alert.Error>{reviews.error}</Alert.Error>}
          {!reviews.loading && !reviews.error && !reviewData.results?.length && <p className="mt-4 text-sm text-ink-3">Aucun feedback pour le moment.</p>}
          <div className="mt-4 space-y-3">
            {(reviewData.results || []).map((review) => <div key={review.id} className="rounded-md border border-line bg-body p-3"><div className="flex items-center justify-between gap-2 text-sm"><span className="font-medium text-ink">{review.student_name || review.student || 'Apprenant'}</span><span className="text-warning">{'★'.repeat(Number(review.rating || 0))}</span></div>{review.comment && <p className="mt-1 text-sm text-ink-2">{review.comment}</p>}</div>)}
          </div>
        </Card>
      </div>
      {c.quizzes?.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink">Quiz du cours</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-3">{c.quizzes.map((quiz) => <div key={quiz.id} className="rounded-md border border-line p-4"><div className="flex items-center justify-between gap-2"><h3 className="font-medium text-ink">{quiz.title}</h3><Badge tone="blue">{quiz.category?.name || quiz.category || 'Quiz'}</Badge></div><p className="mt-1 text-sm text-ink-3">{quiz.questions?.length || 0} question(s) · {quiz.status || 'DRAFT'}</p></div>)}</div>
        </Card>
      )}
      {quizOpen && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink">Créer un quiz</h2>
          <p className="mt-1 text-sm text-ink-3">Commence avec une question et deux réponses. Tu pourras enrichir le quiz ensuite.</p>
          {builderError && <p role="alert" className="mt-3 text-sm text-danger">{builderError}</p>}
          <form onSubmit={createQuiz} className="mt-5 space-y-4">
            <Input label="Titre du quiz" value={quizTitle} onChange={(event) => setQuizTitle(event.target.value)} required maxLength={200} />
            <Select label="Catégorie" value={quizCategory} onChange={(event) => setQuizCategory(event.target.value)} required>
              <option value="" disabled>Choisir une catégorie</option>
              {quizCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
            <Textarea label="Question" value={quizQuestion} onChange={(event) => setQuizQuestion(event.target.value)} required rows={3} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Réponse A" value={quizChoiceA} onChange={(event) => setQuizChoiceA(event.target.value)} required />
              <Input label="Réponse B" value={quizChoiceB} onChange={(event) => setQuizChoiceB(event.target.value)} required />
            </div>
            <Select label="Bonne réponse" value={quizCorrectChoice} onChange={(event) => setQuizCorrectChoice(event.target.value)}>
              <option value="A">Réponse A</option>
              <option value="B">Réponse B</option>
            </Select>
            <Button type="submit" loading={saving} icon={Plus}>Créer le quiz</Button>
          </form>
        </Card>
      )}
      {builderOpen && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-ink">Contenu pédagogique</h2>
            <p className="mt-1 text-sm text-ink-3">Ajoute au moins un chapitre et une leçon avant de soumettre le cours pour validation.</p>
          </div>
          {builderError && <p role="alert" className="text-sm text-danger">{builderError}</p>}
          <form onSubmit={addChapter} className="flex flex-col sm:flex-row gap-3">
            <Input label="Nouveau chapitre" value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} required maxLength={200} />
            <Button type="submit" loading={saving} className="self-end">Ajouter le chapitre</Button>
          </form>
          {c.chapters?.map((chapter) => (
            <div key={chapter.id} className="rounded-md border border-line p-4">
              <h3 className="font-medium text-ink">{chapter.title}</h3>
              {chapter.lessons?.map((lesson) => <p key={lesson.id} className="mt-2 text-sm text-ink-2">{lesson.title}</p>)}
            </div>
          ))}
          {c.chapters?.length > 0 && (
            <form onSubmit={addLesson} className="space-y-3 border-t border-line pt-5">
              <h3 className="font-medium text-ink">Ajouter une leçon texte</h3>
              <label className="block text-sm font-medium text-ink-2">Chapitre
                <select className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2" value={selectedChapter || c.chapters[0]?.id || ""} onChange={(event) => setSelectedChapter(event.target.value)} required>
                  {c.chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
                </select>
              </label>
              <Input label="Titre de la leçon" value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} required maxLength={200} />
              <Textarea label="Contenu" value={lessonText} onChange={(event) => setLessonText(event.target.value)} required rows={5} />
              <Button type="submit" loading={saving}>Enregistrer la leçon</Button>
            </form>
          )}
          {['DRAFT', 'REVIEW'].includes(String(c.status || '').toUpperCase()) && (
            <div className="border-t border-line pt-5">
              <Button onClick={submitCourse} loading={saving}>Soumettre le cours pour validation</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function normalize(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export default MentorCoursesPage;
