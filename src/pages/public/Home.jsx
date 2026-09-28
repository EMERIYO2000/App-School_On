import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Award,
  BookOpen,
  Flag,
  GraduationCap,
  MessagesSquare,
  PenLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { coursesService } from "../../services/courses.service";
import { Card, Badge, Button, Skeleton } from "../../components/ui";
import api, { getError } from "../../services/api";

export default function HomePage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  useEffect(() => {
    let alive = true;
    api
      .get("health/")
      .then((res) => alive && setApiStatus(res.data?.status === "ok" ? "ok" : "degraded"))
      .catch(() => alive && setApiStatus("error"));

    coursesService
      .getCategories()
      .then((data) => alive && setCategories(data))
      .catch((e) => alive && setError(getError(e)));
    return () => {
      alive = false;
    };
  }, []);

  const cats = Array.isArray(categories)
    ? categories
    : categories?.results || [];

  const tiles = [
    { to: "/register", title: t("home.tiles.learn.title"), desc: t("home.tiles.learn.desc"), icon: BookOpen },
    { to: "/register", title: t("home.tiles.train.title"), desc: t("home.tiles.train.desc"), icon: PenLine },
    { to: "/register", title: t("home.tiles.mentors.title"), desc: t("home.tiles.mentors.desc"), icon: Users },
    { to: "/register", title: t("home.tiles.community.title"), desc: t("home.tiles.community.desc"), icon: MessagesSquare },
  ];

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-xs font-medium shadow-1">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              apiStatus === "ok"
                ? "bg-success"
                : apiStatus === "degraded"
                  ? "bg-warning"
                  : "bg-danger"
            }`}
          />
          {apiStatus === "ok"
            ? "API SCHOOL ON connectée"
            : apiStatus === "degraded"
              ? "API partiellement disponible"
              : "API indisponible"}
        </div>
      </div>
      <Hero />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 -mt-10 relative z-10">
        {tiles.map((c) => (
          <Link
            key={c.title}
            to={c.to}
            className="bg-surface rounded-lg border border-line shadow-1 p-4 sm:p-5 hover:shadow-2 hover:border-brand-blue transition-all"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              <c.icon className="w-5 h-5" aria-hidden />
            </span>
            <p className="mt-3 font-semibold text-ink text-sm sm:text-base">
              {c.title}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-ink-3">{c.desc}</p>
          </Link>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-brand-terracotta-dark uppercase tracking-wide">
              {t("home.catsEyebrow")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink">
              {t("home.catsTitle")}
            </h2>
          </div>
          <Link
            to="/courses"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
          >
            {t("home.catsViewAll")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {!categories && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        )}
        {error && (
          <Card className="p-6 text-center text-sm text-ink-3">
            {error} — {t("home.catsError")}
          </Card>
        )}
        {cats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cats.map((c) => {
              const name =
                typeof c === "object" ? c.name || c.title || c.id : c;
              return (
                <Link
                  key={name}
                  to={`/courses?category=${encodeURIComponent(typeof c === "object" ? c.slug || c.id : c)}`}
                  className="group bg-surface rounded-lg border border-line shadow-1 p-5 hover:border-brand-blue hover:shadow-2 transition-all"
                >
                  <BookOpen className="w-6 h-6 text-brand-blue group-hover:text-brand-terracotta transition-colors" />
                  <p className="mt-3 font-medium text-ink capitalize">
                    {name}
                  </p>
                  {typeof c === "object" && c.description && (
                    <p className="mt-1 text-xs text-ink-3 line-clamp-2">
                      {c.description}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Features />

      <section className="bg-gradient-to-br from-brand-blue-dark to-brand-blue text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge tone="warning" className="mb-4">
              {t("home.bandBadge")}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
              {t("home.bandTitle")}
            </h2>
            <p className="mt-3 text-white/85">
              {t("home.bandSubtitle")}
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[0, 1, 2].map((i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 shrink-0 text-warning" /> {t(`home.bandPoints.${i}`)}
                </li>
              ))}
            </ul>
            <Button
              variant="terracotta"
              size="lg"
              className="mt-8"
              onClick={() => (window.location.href = "/register")}
            >
              {t("home.cta")} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src="/logo-full.png"
              alt="SCHOOL ON"
              className="w-64 opacity-90"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-brand-terracotta-dark uppercase tracking-wide">
            {t("home.trustEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-ink">
            {t("home.trustTitle")}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <GraduationCap className="w-6 h-6 text-brand-blue" />
            <h3 className="mt-3 font-semibold">{t("home.trustLearnerTitle")}</h3>
            <p className="mt-1.5 text-sm text-ink-3">
              {t("home.trustLearnerDesc")}
            </p>
          </Card>
          <Card className="p-6">
            <Users className="w-6 h-6 text-brand-terracotta" />
            <h3 className="mt-3 font-semibold">{t("home.trustMentorTitle")}</h3>
            <p className="mt-1.5 text-sm text-ink-3">
              {t("home.trustMentorDesc")}
            </p>
          </Card>
          <Card className="p-6">
            <ShieldCheck className="w-6 h-6 text-success" />
            <h3 className="mt-3 font-semibold">{t("home.trustTrustTitle")}</h3>
            <p className="mt-1.5 text-sm text-ink-3">
              {t("home.trustTrustDesc")}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  const { t } = useTranslation();
  const cards = [0, 1, 2, 3].map((i) => ({
    title: t(`home.cards.${i}.title`),
    desc: t(`home.cards.${i}.desc`),
    icon: [BookOpen, PenLine, MessagesSquare, Award][i],
  }));
  return (
    <section className="bg-gradient-to-br from-body via-surface to-brand-blue-light/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill bg-surface border border-line px-3 py-1.5 text-xs font-medium text-ink-2 shadow-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" /> {t("home.heroBadge")}
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-ink leading-tight">
            {t("home.heroTitleStart")} <span className="text-brand-blue">{t("home.heroTitleAccent")}</span>
          </h1>
          <p className="mt-4 text-lg text-ink-2 max-w-xl">
            {t("home.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center h-12 px-6 rounded-md text-base font-medium text-white bg-brand-blue hover:bg-brand-blue-dark"
            >
              {t("home.cta")}
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center h-12 px-6 rounded-md text-base font-medium text-ink-2 border border-line bg-surface hover:bg-surface-2"
            >
              {t("home.seeCourses")}
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-ink-3">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" aria-hidden /> {t("home.trustCert")}
            </span>
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" aria-hidden /> {t("home.trustMobile")}
            </span>
            <span className="flex items-center gap-1.5">
              <Flag className="w-4 h-4" aria-hidden /> {t("home.trustMade")}
            </span>
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-4">
          {cards.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-5 hover:shadow-2 transition-all">
                <Icon className="w-6 h-6 text-brand-terracotta" />
                <h3 className="mt-3 font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-ink-3">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useTranslation();
  const items = [0, 1, 2].map((i) => ({
    icon: [Award, Users, Sparkles][i],
    title: t(`home.features.${i}.title`),
    desc: t(`home.features.${i}.desc`),
  }));
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="p-6 text-center">
              <span className="inline-flex h-12 w-12 rounded-full bg-brand-blue-light text-brand-blue items-center justify-center">
                <Icon className="w-6 h-6" />
              </span>
              <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-3">{f.desc}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}