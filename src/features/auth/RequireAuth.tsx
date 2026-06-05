import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "./SessionContext";

export function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useSession();

  if (isBootstrapping) {
    return (
      <div className="auth-state">
        <div className="auth-state-card">
          <div className="brand-kicker">Rerkdee</div>
          <h1>Checking admin session</h1>
          <p>Loading the current operator context before opening the portal.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
