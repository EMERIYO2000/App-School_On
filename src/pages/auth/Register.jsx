import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/auth.service";
import { getError } from "../../services/api";
import { USER_TYPES } from "../../lib/constants";
import { Button, Input, Select, Alert } from "../../components/ui";

const ROLE_STUDENT = USER_TYPES.STUDENT;
const ROLE_TEACHER = USER_TYPES.TEACHER;

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ROLE_CHOICES = [
    {
      value: ROLE_STUDENT,
      label: t("register.roleStudent"),
      description: t("register.roleStudentDesc"),
    },
    {
      value: ROLE_TEACHER,
      label: t("register.roleTeacher"),
      description: t("register.roleTeacherDesc"),
    },
  ];

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    user_type: USER_TYPES.STUDENT,
    password: "",
    confirm_password: "",
  });
  const [show, setShow] = useState({ pwd: false, confirm: false });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError(t("register.mismatch"));
      return;
    }
    setSubmitting(true);
    try {
      await register({
        full_name: form.full_name,
        email: form.email,
        phone_number: form.phone_number,
        user_type: form.user_type,
        password: form.password,
        confirm_password: form.confirm_password,
      });
      setCreated(true);
    } catch (err) {
      setError(getError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="text-center py-10 animate-fade-in">
        <span className="inline-flex h-16 w-16 rounded-full bg-success-light text-success items-center justify-center text-3xl mb-5">
          ✓
        </span>
        <h1 className="text-2xl font-bold text-ink">
          {t("register.createdTitle")}
        </h1>
        <p className="mt-2 text-sm text-ink-3">
          {t("register.createdSubtitle")}
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <Button
            size="lg"
            fullWidth
            onClick={() => navigate("/choose-journey")}
          >
            {t("register.chooseJourney")}
          </Button>
          <Link
            to="/login"
            className="text-sm font-medium text-brand-blue hover:underline"
          >
            {t("register.orLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{t("register.title")}</h1>
        <p className="mt-1 text-sm text-ink-3">{t("register.subtitle")}</p>
      </div>
      {error && (
        <Alert.Error className="mb-5" title={t("register.errorTitle")}>
          {error}
        </Alert.Error>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label={t("register.fullName")}
          value={form.full_name}
          onChange={set("full_name")}
          placeholder={t("register.fullNamePh")}
          autoComplete="name"
          required
        />
        <Input
          label={t("register.email")}
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder={t("register.emailPh")}
          autoComplete="email"
          required
        />
        <Input
          label={t("register.phone")}
          type="tel"
          value={form.phone_number}
          onChange={set("phone_number")}
          placeholder={t("register.phonePh")}
          autoComplete="tel"
          hint={t("register.phoneHint")}
        />
        <Select
          label={t("register.asRole")}
          value={form.user_type}
          onChange={set("user_type")}
          required
        >
          {ROLE_CHOICES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t("register.password")}
            type={show.pwd ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            hint={t("register.passwordHint")}
          />
          <Input
            label={t("register.confirm")}
            type={show.confirm ? "text" : "password"}
            value={form.confirm_password}
            onChange={set("confirm_password")}
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
        </div>
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          icon={UserPlus}
        >
          {t("register.submit")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-3">
        {t("register.haveAccount")}{" "}
        <Link
          to="/login"
          className="font-medium text-brand-blue hover:underline"
        >
          {t("register.login")}
        </Link>
      </p>
    </div>
  );
}
