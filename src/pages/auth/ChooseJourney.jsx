import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Compass, Users, Hand } from "lucide-react";
import { useAuth, homePathForRole } from "../../context/AuthContext";
import { Button, Badge } from "../../components/ui";

export default function ChooseJourneyPage() {
  const { user, chooseJourney } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const options = [
    {
      key: "LEARNER",
      title: t("journey.learn"),
      desc: t("journey.learnDesc"),
      icon: BookOpen,
      tone: "bg-brand-blue-light text-brand-blue-dark",
    },
    {
      key: "MENTOR",
      title: t("journey.teach"),
      desc: t("journey.teachDesc"),
      icon: Users,
      tone: "bg-brand-terracotta-light text-brand-terracotta-dark",
    },
    {
      key: "LATER",
      title: t("journey.later"),
      desc: t("journey.laterDesc"),
      icon: Compass,
      tone: "bg-surface-2 text-ink-2",
    },
  ];

  function pick(journey) {
    chooseJourney(journey);
    if (journey === "MENTOR") {
      const isMentor = user?.is_teacher || user?.user_type === "TEACHER";
      navigate(isMentor ? "/mentor/dashboard" : "/mentor/apply");
    }
    else navigate("/dashboard");
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-ink">{t("journey.title")}</h1>
        <p className="mt-1.5 text-sm text-ink-3">
          {t("journey.hello", { name: user?.full_name?.split(" ")[0] || "" })}{" "}
          <Hand className="w-4 h-4 inline" aria-hidden />
        </p>
      </div>
      <div className="grid gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => pick(opt.key)}
              className="group text-left bg-surface rounded-lg border border-line shadow-1 p-5 hover:border-brand-blue hover:shadow-2 transition-all flex gap-4 items-start"
            >
              <span
                className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 ${opt.tone}`}
              >
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2 font-semibold text-ink group-hover:text-brand-blue transition-colors">
                  {opt.title}
                  {opt.key === "MENTOR" && (
                    <Badge tone="warning">{t("journey.applied")}</Badge>
                  )}
                </span>
                <span className="mt-1 text-sm text-ink-3 block">
                  {opt.desc}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={() => navigate(homePathForRole("LEARNER"))}
        >
          {t("journey.explore")}
        </Button>
      </div>
    </div>
  );
}
