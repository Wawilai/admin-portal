import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../../features/auth/SessionContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "DB" },
  { to: "/users", label: "Users", icon: "US" },
  { to: "/credits", label: "Credits", icon: "CR" },
  { to: "/subscriptions", label: "Subscriptions", icon: "SU" },
  { to: "/promo", label: "Promo", icon: "PR" },
  { to: "/ai-ops", label: "AI Ops", icon: "AI" },
  { to: "/notifications", label: "Notifications", icon: "NT" },
  { to: "/remote-config", label: "Remote Config", icon: "RC" },
  { to: "/audit-log", label: "Audit Log", icon: "AL" },
];

function formatActiveLabel(pathname: string) {
  const matched = navItems.find((item) => item.to === pathname);

  if (matched) {
    return matched.label;
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment ? lastSegment.replace(/-/g, " ") : "Dashboard";
}

export function AdminShell() {
  const location = useLocation();
  const { signOut, user } = useSession();
  const activeLabel = formatActiveLabel(location.pathname);

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-kicker">Rerkdee</div>
          <div className="brand-title">Admin Portal</div>
          <div className="brand-sub">
            Operations workspace for AI, subscriptions, credits, and user care.
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-pane">
        <header className="topbar">
          <div className="topbar-copy">
            <div className="topbar-label">Operations Console</div>
            <div className="topbar-title">{activeLabel}</div>
            <div className="breadcrumbs">
              <span>Portal</span>
              <span>/</span>
              <span>{activeLabel}</span>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="operator-chip">
              <div className="operator-name">{user?.displayName}</div>
              <div className="operator-role">{user?.role}</div>
            </div>
            <button className="ghost-button" type="button">
              Preview API State
            </button>
            <button className="primary-button" type="button">
              Incident Mode
            </button>
            <button className="ghost-button" onClick={signOut} type="button">
              Sign out
            </button>
          </div>
        </header>

        <section className="content-pane">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
