import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  LogOut,
  Menu,
  Search,
  User as UserIcon,
  Wallet,
  X,
} from "lucide-react";
import { navForRole } from "./navConfig";
import { useAuth, homePathForRole } from "../../context/AuthContext";
import { Avatar, Badge, Button } from "../ui";
import ThemeToggle from "../ui/ThemeToggle";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { getAvatar, getFullName } from "../../lib/format";

function Brand({ expanded = true }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-5 shrink-0">
      <img src="/logo-mark.png" alt="SCHOOL ON" className="w-9 h-9" />
      {expanded && (
        <span className="text-lg font-bold tracking-tight text-ink">
          SCHOOL <span className="text-brand-terracotta">ON</span>
        </span>
      )}
    </Link>
  );
}

function NavItems({ sections, compact = false }) {
  const { t } = useTranslation();
  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          {!compact && (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
              {t(section.label)}
            </p>
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center rounded-md text-sm font-medium transition-colors ${
                        compact
                          ? "justify-center px-0 py-2.5"
                          : "gap-3 px-3 py-2.5"
                      } ${
                        isActive
                          ? "bg-brand-blue-light text-brand-blue-dark"
                          : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 shrink-0" aria-hidden />
                    {!compact && <span className="truncate">{t(item.label)}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppShell({
  navSections,
  mobileItems,
  accent = "blue",
  children,
  title,
}) {
  const { user, role, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  const name = getFullName(user);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const doLogout = () => {
    setMenu(false);
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-body">
      <div className="lg:flex">
        <aside className="hidden lg:flex lg:w-64 xl:w-72 shrink-0 border-r border-line bg-surface min-h-screen flex-col sticky top-0 h-screen">
          <Brand />
          <NavItems sections={navSections} />
        </aside>

        <aside className="hidden md:flex lg:hidden w-16 shrink-0 border-r border-line bg-surface min-h-screen flex-col sticky top-0 h-screen">
          <Brand expanded={false} />
          <NavItems sections={navSections} compact />
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
            <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
              <button
                className="lg:hidden p-2 rounded-md hover:bg-surface-2 text-ink-2 md:hidden"
                onClick={() => setDrawer(true)}
                aria-label={t("appshell.openMenu")}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm text-ink-3">
                <span className="font-medium capitalize text-ink-2">
                  {role?.toLowerCase()}
                </span>
                {title && <span className="text-neutral-300">/</span>}
                {title && <span>{title}</span>}
              </div>
              <div className="hidden md:block flex-1 max-w-md ml-auto mr-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
                  <input
                    className="w-full rounded-md border border-line bg-body pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-surface"
                    placeholder={t("appshell.search")}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                <ThemeToggle className="!px-2" />
                <LanguageSwitcher compact />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/notifications")}
                  aria-label={t("appshell.notifications")}
                >
                  <Bell className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/wallet")}
                  aria-label={t("appshell.wallet")}
                >
                  <Wallet className="w-5 h-5" />
                </Button>
                <div className="relative ml-1" ref={menuRef}>
                  <button
                    onClick={() => setMenu((m) => !m)}
                    className="flex items-center gap-2 rounded-full p-1 hover:bg-surface-2"
                    aria-label={t("appshell.accountMenu")}
                  >
                    <Avatar src={getAvatar(user)} alt={name} size="md" />
                  </button>
                  {menu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg bg-surface border border-line shadow-2 py-1.5 animate-fade-in origin-top-right">
                      <div className="px-4 py-2.5 border-b border-line">
                        <p className="text-sm font-medium text-ink truncate">
                          {name}
                        </p>
                        <p className="text-xs text-ink-3 truncate">
                          {user?.email}
                        </p>
                        <div className="mt-1.5">
                          <Badge
                            tone={
                              accent === "terracotta" ? "terracotta" : "blue"
                            }
                          >
                            {role}
                          </Badge>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-2 hover:bg-surface-2"
                      >
                        <UserIcon className="w-4 h-4" /> {t("appshell.myProfile")}
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-2 hover:bg-surface-2"
                      >
                        <Wallet className="w-4 h-4" /> {t("appshell.settings")}
                      </Link>
                      <button
                        onClick={doLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error-light/50"
                      >
                        <LogOut className="w-4 h-4" /> {t("appshell.logout")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-28 md:pb-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10px] font-medium ${
                    isActive ? "text-brand-blue" : "text-ink-3"
                  }`
                }
              >
                <Icon className="w-5 h-5" aria-hidden />
                {t(item.label)}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface shadow-3 flex flex-col animate-fade-in">
<div className="flex items-center justify-between pr-3">
                <Brand />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawer(false)}
                  aria-label={t("appshell.closeMenu")}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <NavItems sections={navSections} />
              <div className="border-t border-line p-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={doLogout}
                  icon={LogOut}
                >
                  {t("appshell.logout")}
                </Button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SpaceSwitcher({ current, role }) {
  return (
    <Link
      to={homePathForRole(role)}
      className="flex items-center gap-2 text-sm text-ink-3 hover:text-ink"
    >
      <Badge tone="blue">{current}</Badge>
    </Link>
  );
}
