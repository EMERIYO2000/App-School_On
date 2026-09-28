import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth, homePathForRole } from "../../context/AuthContext";
import { authService } from "../../services/auth.service";
import { getError } from "../../services/api";
import { Button, Input, Alert } from "../../components/ui";

export default function LoginPage() {
  const { login, role } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ login_id: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const tokens = await login({
        login_id: form.login_id,
        password: form.password,
      });
      const target =
        from || homePathForRole(tokens.user ? computeFor(tokens.user) : role);
      navigate(target, { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setSubmitting(false);
    }
  }

  function computeFor(u) {
    if (
      u.is_admin ||
      u.is_staff ||
      String(u.user_type).toUpperCase() === "ADMIN"
    )
      return "/admin/dashboard";
    if (u.is_teacher) return "/mentor/dashboard";
    return "/dashboard";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-ink-3">{t("login.subtitle")}</p>
      </div>
      {error && (
        <Alert.Error className="mb-5" title={t("login.errorTitle")}>
          {error}
        </Alert.Error>
      )}
      <form onSubmit={onSubmit} className="space-y-5">
        <Input
          label={t("login.identifier")}
          type="text"
          autoComplete="username"
          value={form.login_id}
          onChange={set("login_id")}
          placeholder={t("login.identifierPh")}
          required
        />
        <div>
          <Input
            label={t("login.password")}
            type={show ? "text" : "password"}
            autoComplete="current-password"
            value={form.password}
            onChange={set("password")}
            placeholder={t("login.passwordPh")}
            required
            trailing={
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="p-1.5 text-ink-3 hover:text-ink"
                aria-label={show ? t("login.hide") : t("login.show")}
              >
                {show ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
        </div>
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-brand-blue hover:underline"
          >
            {t("login.forgot")}
          </Link>
        </div>
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={submitting}
          icon={LogIn}
        >
          {t("login.submit")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-3">
        {t("login.noAccount")}{" "}
        <Link
          to="/register"
          className="font-medium text-brand-blue hover:underline"
        >
          {t("login.signup")}
        </Link>
      </p>
    </div>
  );
}
