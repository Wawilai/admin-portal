import { useRouterState, Link } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { useSession } from "@/features/auth/SessionContext";
import { getEnvironmentBadge } from "@/lib/environment";

const LABELS: Record<string, string> = {
  "": "Dashboard",
  users: "Users",
  credits: "Credits",
  subscriptions: "Subscriptions",
  promo: "Promo",
  "ai-ops": "AI Ops",
  "ai-usage": "AI Usage",
  notifications: "Notifications",
  "remote-config": "Remote Config",
  "audit-log": "Audit Log",
  "admin-users": "Admin Users",
};

function labelFor(segment: string) {
  return LABELS[segment] ?? segment;
}

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { signOut } = useSession();
  const environment = getEnvironmentBadge();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs =
    segments.length === 0
      ? [{ href: "/", label: "Dashboard" }]
      : [
          { href: "/", label: "Dashboard" },
          ...segments.map((seg, i) => ({
            href: "/" + segments.slice(0, i + 1).join("/"),
            label: labelFor(seg),
          })),
        ];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
        {crumbs.map((c, i) => (
          <div key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground">{c.label}</span>
            ) : (
              <Link
                to={c.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <span
          className={`hidden md:inline-flex items-center gap-1.5 rounded-md border bg-surface px-2 py-1 text-[11px] font-medium ${environment.chipClassName}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${environment.dotClassName}`} />
          {environment.label}
        </span>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </header>
  );
}
