import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useSession } from "../../features/auth/SessionContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: "DB", permission: "dashboard.read" },
  { to: "/users", label: "Users", icon: "US", permission: "users.read" },
  { to: "/credits", label: "Credits", icon: "CR", permission: "credits.read" },
  {
    to: "/subscriptions",
    label: "Subscriptions",
    icon: "SU",
    permission: "subscriptions.read",
  },
  { to: "/promo", label: "Promo", icon: "PR", permission: "promo.read" },
  { to: "/ai-ops", label: "AI Ops", icon: "AI", permission: "dashboard.read" },
  {
    to: "/notifications",
    label: "Notifications",
    icon: "NT",
    permission: "notifications.read",
  },
  {
    to: "/remote-config",
    label: "Remote Config",
    icon: "RC",
    permission: "config.read",
  },
  { to: "/audit-log", label: "Audit Log", icon: "AL", permission: "audit.read" },
  {
    to: "/admin-users",
    label: "Admin Users",
    icon: "AU",
    permission: "admin_users.read",
  },
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

function resolveEnvironmentLabel() {
  const rawValue = (
    import.meta.env.VITE_APP_ENV ??
    import.meta.env.MODE ??
    "local"
  ).toString().toLowerCase();

  if (rawValue.includes("prod")) {
    return { label: "Production", tone: "production" as const };
  }
  if (rawValue.includes("stage")) {
    return { label: "Staging", tone: "staging" as const };
  }
  return { label: "Local", tone: "local" as const };
}

export function AdminShell() {
  const location = useLocation();
  const { hasPermission, signOut, user } = useSession();
  const visibleNavItems = navItems.filter((item) => hasPermission(item.permission));
  const activeLabel = formatActiveLabel(location.pathname);
  const environment = resolveEnvironmentLabel();

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
          {visibleNavItems.map((item) => (
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
            <div className={`environment-badge tone-${environment.tone}`}>
              {environment.label}
            </div>
            <div className="operator-chip">
              <div className="operator-name">{user?.displayName}</div>
              <div className="operator-role">{user?.role}</div>
            </div>
            {!hasPermission("dashboard.read") ? (
              <div className="permission-badge">Limited access</div>
            ) : null}
            <button className="ghost-button" type="button">
              Preview API State
            </button>
            {hasPermission("config.write") ? (
              <button className="primary-button" type="button">
                Incident Mode
              </button>
            ) : null}
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
