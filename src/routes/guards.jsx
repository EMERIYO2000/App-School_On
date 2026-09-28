import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, homePathForRole } from "../context/AuthContext";
import { Spinner } from "../components/ui/States";

function FullPageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-body">
      <img
        src="/logo-mark.png"
        alt="SCHOOL ON"
        className="w-16 h-16 animate-pulse"
      />
      <Spinner className="w-6 h-6 text-brand-blue" />
    </div>
  );
}

export function PublicRoute({ children }) {
  const { isAuthenticated, initializing, role } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  const isCommunityPath =
    location.pathname === "/community" ||
    location.pathname.startsWith("/community/");
  const isCatalogPath =
    location.pathname === "/courses" || location.pathname.startsWith("/courses/");
  const isMentorPath =
    location.pathname === "/mentors" || location.pathname.startsWith("/mentors/");
  const isCertificatePath =
    location.pathname === "/verify" || location.pathname.startsWith("/certificate/");
  if (
    isAuthenticated &&
    location.pathname !== "/choose-journey" &&
    !isCommunityPath &&
    !isCatalogPath &&
    !isMentorPath &&
    !isCertificatePath
  ) {
    const from = location.state?.from;
    return <Navigate to={from || homePathForRole(role)} replace />;
  }
  return children || <Outlet />;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing, role } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }
  const needed = location.state?.role;
  if (
    needed &&
    role !== needed &&
    !(needed === "LEARNER" && role === "MENTOR")
  ) {
    return <Navigate to="/forbidden" replace />;
  }
  return children || <Outlet />;
}

export function RoleRoute({ roles, children }) {
  const { role, isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(role)) return <Navigate to="/forbidden" replace />;
  return children || <Outlet />;
}

export function PermissionRoute({ check, children }) {
  const { user, role, isAuthenticated, initializing } = useAuth();
  if (initializing) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!check({ user, role })) return <Navigate to="/forbidden" replace />;
  return children || <Outlet />;
}
