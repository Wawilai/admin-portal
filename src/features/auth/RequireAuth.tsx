import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useSession } from "./SessionContext";

export function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, bootstrapFailed } = useSession();

  if (isBootstrapping) {
    return (
      <div className="auth-state">
        <div className="auth-state-card">
          <div className="brand-kicker">Rerkdee</div>
          <h1>Checking session</h1>
          <p>Loading the current operator context before opening the portal.</p>
        </div>
      </div>
    );
  }

  if (bootstrapFailed) {
    return (
      <div className="auth-state">
        <div className="auth-state-card">
          <div className="brand-kicker">Rerkdee</div>
          <h1>Connection error</h1>
          <p>
            The portal could not reach the admin API. Check your network
            connection and reload the page. If the problem persists, verify
            that the backend is running.
          </p>
          <div style={{ marginTop: "22px" }}>
            <button
              className="primary-button"
              onClick={() => window.location.reload()}
              type="button"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
