import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/auth.service";
import { profileService } from "../services/profile.service";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "../services/api";

const AuthContext = createContext(null);

export const computeRole = (user) => {
  if (!user) return null;
  const type = String(user.user_type || user.role || "").toUpperCase();
  if (user.is_admin || user.is_staff || type === "ADMIN") return "ADMIN";
  if (user.is_teacher || type === "MENTOR" || type === "TUTOR" || type === "TEACHER") return "MENTOR";
  return "LEARNER";
};

export const homePathForRole = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "MENTOR") return "/mentor/dashboard";
  return "/dashboard";
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(
    !!(getAccessToken() || getRefreshToken()),
  );
  const [pendingJourney, setPendingJourney] = useState(() =>
    sessionStorage.getItem("so_journey"),
  );

  const role = computeRole(user);

  const loadProfile = useCallback(async () => {
    try {
      const data = await profileService.getMyProfile();
      setProfile(data);
      if (data?.user) setUser((current) => ({ ...current, ...data.user }));
      return data;
    } catch {
      return null;
    }
  }, []);

  const fetchMe = useCallback(async () => {
    const me = await authService.me();
    setUser(me);
    loadProfile();
    return me;
  }, [loadProfile]);

  useEffect(() => {
    let alive = true;
    const bootstrap = async () => {
      if (!getAccessToken() && !getRefreshToken()) {
        setInitializing(false);
        return;
      }
      try {
        const me = await fetchMe();
        if (!alive) return;
        if (!me) {
          clearTokens();
          setUser(null);
        }
      } catch {
        if (alive) clearTokens();
      } finally {
        if (alive) setInitializing(false);
      }
    };
    bootstrap();
    return () => {
      alive = false;
    };
  }, [fetchMe]);

  const login = useCallback(
    async (payload) => {
      const data = await authService.login(payload);
      const me = await authService.me();
      setUser(me);
      loadProfile();
      return { tokens: data, user: me };
    },
    [loadProfile],
  );

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    if (data?.user) setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setProfile(null);
    setPendingJourney(null);
    sessionStorage.removeItem("so_journey");
  }, []);

  const chooseJourney = useCallback((journey) => {
    sessionStorage.setItem("so_journey", journey);
    setPendingJourney(journey);
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const me = await fetchMe();
      return me;
    } catch {
      return null;
    }
  }, [fetchMe]);

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      isAuthenticated: !!user,
      initializing,
      pendingJourney,
      login,
      register,
      logout,
      chooseJourney,
      refreshAuth,
      loadProfile,
      setUser,
      setProfile,
      hasToken: !!(getAccessToken() || getRefreshToken()),
      setTokens,
    }),
    [
      user,
      profile,
      role,
      initializing,
      pendingJourney,
      login,
      register,
      logout,
      chooseJourney,
      refreshAuth,
      loadProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
};
