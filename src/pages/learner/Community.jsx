import { useState } from "react";
import { ArrowLeft, MessageCircle, Plus, ThumbsUp, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { communityService } from "../../services/extras.service";
import { useFetch } from "../../hooks/useFetch";
import { getError } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  PageLoader,
  Select,
  Textarea,
} from "../../components/ui";
import { getAvatar, getFullName, relativeTime } from "../../lib/format";

const normalize = (data) => (Array.isArray(data) ? data : data?.results || []);

export function CommunityPage() {
  const [category, setCategory] = useState("");
  const categories = useFetch(
    () => communityService.getCategories().then(normalize),
    [],
  );
  const threads = useFetch(
    () =>
      communityService.getThreads(category ? { category } : {}).then(normalize),
    [category],
  );
  const results = threads.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Communauté éducative</h1>
          <p className="mt-1 text-sm text-ink-3">
            Pose tes questions, partage une méthode et aide les autres à
            progresser.
          </p>
        </div>
        <Link to="/community/create">
          <Button icon={Plus}>Créer une publication</Button>
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          active={!category}
          onClick={() => setCategory("")}
          label="Tout"
        />
        {(categories.data || []).map((item) => (
          <FilterChip
            key={item.slug}
            active={category === item.slug}
            onClick={() => setCategory(item.slug)}
            label={item.name}
          />
        ))}
      </div>
      {threads.loading && <PageLoader label="Chargement de la communauté…" />}
      {!threads.loading && threads.error && (
        <ErrorState
          message={getError(threads.error)}
          onRetry={threads.refresh}
        />
      )}
      {!threads.loading && !threads.error && results.length === 0 && (
        <Card>
          <EmptyState
            icon={Users}
            title="Rien ici pour le moment"
            description="Lance une question éducative pour commencer l’entraide."
            action={
              <Link to="/community/create">
                <Button>Créer la première publication</Button>
              </Link>
            }
          />
        </Card>
      )}
      {!threads.loading && !threads.error && results.length > 0 && (
        <div className="space-y-4">
          {results.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-medium border transition-colors ${active ? "bg-brand-blue text-white border-brand-blue" : "bg-surface text-ink-2 border-line hover:border-line"}`}
    >
      {label}
    </button>
  );
}

function ThreadCard({ thread }) {
  const author = thread.author || {};
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <Avatar src={getAvatar(author)} alt={getFullName(author)} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink truncate">
            {getFullName(author)}
          </p>
          {(thread.category_detail?.name || thread.category) && (
            <Badge tone="blue" className="mt-0.5">
              {thread.category_detail?.name || thread.category}
            </Badge>
          )}
        </div>
        <span className="text-xs text-ink-3">
          {relativeTime(thread.created_at)}
        </span>
      </div>
      <Link to={`/community/${thread.id}`} className="block mt-3 group">
        <h3 className="font-semibold text-ink group-hover:text-brand-blue transition-colors line-clamp-2">
          {thread.title}
        </h3>
        <p className="mt-1 text-sm text-ink-2 line-clamp-3">{thread.content}</p>
      </Link>
      <div className="mt-4 pt-4 border-t border-line flex items-center gap-5 text-sm text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4" /> {thread.replies_count || 0}
        </span>
        <LikeButton
          key={`thread-${thread.id}`}
          targetType="thread"
          targetId={thread.id}
          initialLiked={thread.liked_by_user}
          initialCount={thread.likes_count}
        />
        {thread.is_resolved && <Badge tone="success">Résolu</Badge>}
        <Link
          to={`/community/${thread.id}`}
          className="ml-auto text-brand-blue font-medium"
        >
          Voir <ArrowLeft className="w-4 h-4 inline rotate-180" />
        </Link>
      </div>
    </Card>
  );
}

function LikeButton({ targetType, targetId, initialLiked = false, initialCount = 0 }) {
  const { user } = useAuth();
  const toast = useToast?.();
  const [liked, setLiked] = useState(Boolean(initialLiked));
  const [count, setCount] = useState(initialCount || 0);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (!user || loading) return;
    setLoading(true);
    try {
      const result = targetType === "thread"
        ? await communityService.likeThread(targetId)
        : await communityService.likePost(targetId);
      setLiked(result.liked);
      setCount(result.likes_count);
    } catch (err) {
      toast?.error?.(getError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={!user || loading}
      aria-pressed={liked}
      title={user ? (liked ? "Retirer le like" : "J’aime") : "Connecte-toi pour aimer"}
      className={`inline-flex items-center gap-1.5 transition-colors ${liked ? "text-brand-blue" : "text-ink-3 hover:text-brand-blue"} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <ThumbsUp className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {count}
    </button>
  );
}

export function CommunityCreatePage() {
  const navigate = useNavigate();
  const toast = useToast?.();
  const { user } = useAuth();
  const categories = useFetch(
    () => communityService.getCategories().then(normalize),
    [],
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const created = await communityService.createThread({
        title: form.get("title"),
        content: form.get("content"),
        category: form.get("category"),
        content_type: form.get("content_type"),
      });
      toast?.success?.("Publication créée");
      navigate(`/community/${created.id}`);
    } catch (err) {
      setError(getError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-brand-blue"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à la communauté
      </Link>
      <h1 className="text-2xl font-bold text-ink">Créer une publication</h1>
      {!user && (
        <Alert.Info>
          Connecte-toi pour publier une question ou aider la communauté.
        </Alert.Info>
      )}
      {error && <Alert.Error>{error}</Alert.Error>}
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <Select
            label="Type de publication"
            name="content_type"
            defaultValue="QUESTION"
            required
          >
            <option value="QUESTION">Question</option>
            <option value="DISCUSSION">Discussion éducative</option>
            <option value="EXERCISE_HELP">Aide sur un exercice</option>
            <option value="RESOURCE">Ressource pédagogique</option>
            <option value="ORIENTATION">Orientation</option>
          </Select>
          <Select label="Catégorie" name="category" defaultValue="" required>
            <option value="" disabled>
              Choisir une catégorie
            </option>
            {(categories.data || []).map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </Select>
          <Input
            label="Titre"
            name="title"
            placeholder="Une question claire, un partage, un tutoriel…"
            required
          />
          <Textarea
            label="Contenu"
            name="content"
            rows={7}
            placeholder="Explique ton sujet. Sois précis pour recevoir de vraies réponses."
            required
          />
          <Button
            type="submit"
            fullWidth
            loading={submitting}
            disabled={!user}
            icon={Plus}
          >
            Publier
          </Button>
        </form>
      </Card>
    </div>
  );
}

export function CommunityPostPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const toast = useToast?.();
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");
  const thread = useFetch(() => communityService.getThread(postId), [postId]);
  const post = thread.data?.thread || thread.data || {};
  const author = post.author || {};
  const replies = post.replies || [];

  async function sendReply(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    setReplying(true);
    setError("");
    try {
      await communityService.reply(postId, { content: reply });
      setReply("");
      thread.refresh();
      toast?.success?.("Réponse publiée");
    } catch (err) {
      setError(getError(err));
    } finally {
      setReplying(false);
    }
  }

  async function acceptReply(id) {
    try {
      await communityService.acceptPost(id);
      thread.refresh();
      toast?.success?.("Réponse marquée comme solution");
    } catch (err) {
      setError(getError(err));
    }
  }

  async function reportThread() {
    try {
      await communityService.reportThread(postId, {
        reason: "OTHER",
        description: "Signalement envoyé depuis la discussion.",
      });
      toast?.success?.("Signalement envoyé");
    } catch (err) {
      setError(getError(err));
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-brand-blue"
      >
        <ArrowLeft className="w-4 h-4" /> Communauté
      </Link>
      {thread.loading && <PageLoader />}
      {!thread.loading && thread.error && (
        <ErrorState message={getError(thread.error)} onRetry={thread.refresh} />
      )}
      {!thread.loading && !thread.error && post.id && (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Avatar
                src={getAvatar(author)}
                alt={getFullName(author)}
                size="md"
              />
              <div>
                <p className="text-sm font-medium text-ink">
                  {getFullName(author)}
                </p>
                <p className="text-xs text-ink-3">
                  {relativeTime(post.created_at)}
                </p>
              </div>
              {(post.category_detail?.name || post.category) && (
                <Badge tone="blue" className="ml-auto">
                  {post.category_detail?.name || post.category}
                </Badge>
              )}
            </div>
            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-ink">
              {post.title}
            </h1>
            <p className="mt-3 text-ink-2 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
            <div className="mt-5 flex gap-2 border-t border-line pt-4">
              <LikeButton
                key={`thread-detail-${post.id}`}
                targetType="thread"
                targetId={post.id}
                initialLiked={post.liked_by_user}
                initialCount={post.likes_count}
              />
              {user && (
                <Button variant="ghost" size="sm" onClick={reportThread}>
                  Signaler
                </Button>
              )}
              {post.is_resolved && <Badge tone="success">Résolu</Badge>}
            </div>
          </Card>
          <div>
            <h2 className="text-lg font-semibold text-ink mb-4">
              Réponses{" "}
              <span className="text-ink-3 text-sm">({replies.length})</span>
            </h2>
            <div className="space-y-4">
              {replies.length === 0 && (
                <Card className="p-6">
                  <EmptyState
                    icon={MessageCircle}
                    title="Aucune réponse"
                    description="Sois le premier à répondre."
                  />
                </Card>
              )}
              {replies.map((item) => {
                const replyAuthor = item.author || {};
                return (
                  <Card key={item.id} className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={getAvatar(replyAuthor)}
                        alt={getFullName(replyAuthor)}
                        size="sm"
                      />
                      <p className="text-sm font-medium text-ink">
                        {getFullName(replyAuthor)}
                      </p>
                      <span className="text-xs text-ink-3 ml-auto">
                        {relativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-ink-2 whitespace-pre-wrap">
                      {item.content}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <LikeButton
                        key={`post-${item.id}`}
                        targetType="post"
                        targetId={item.id}
                        initialLiked={item.liked_by_user}
                        initialCount={item.likes_count}
                      />
                      {user?.id === author.id && !post.is_resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acceptReply(item.id)}
                        >
                          Accepter comme solution
                        </Button>
                      )}
                      {item.accepted && (
                        <Badge tone="success">Solution acceptée</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            <Card className="mt-6 p-5">
              {error && <Alert.Error className="mb-4">{error}</Alert.Error>}
              {!user ? (
                <Alert.Info>
                  Connecte-toi pour répondre à cette discussion.
                </Alert.Info>
              ) : (
                <form onSubmit={sendReply} className="space-y-3">
                  <Textarea
                    value={reply}
                    onChange={(event) => setReply(event.target.value)}
                    placeholder="Écrire une réponse attentionnée…"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      loading={replying}
                      disabled={!reply.trim()}
                    >
                      Répondre
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default CommunityPage;
