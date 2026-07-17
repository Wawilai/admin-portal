import { useRouterState, Link } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { useSession } from "@/features/auth/SessionContext";
import { getEnvironmentBadge } from "@/lib/environment";
import { MobileNav } from "@/components/layout/MobileNav";

const LABELS: Record<string, string> = {
  "": "Dashboard",
  users: "Users",
  credits: "Credits",
  subscriptions: "Subscriptions",
  promo: "Promo",
  "ai-ops": "AI Ops",
  "ai-usage": "AI Usage",
  notifications: "Notifications",
  "feature-access": "Feature Access",
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
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />

        {/* Full breadcrumb trail on md+ */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-[13px] md:flex">
          {crumbs.map((c, i) => (
            <div key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
              {i === crumbs.length - 1 ? (
                <span className="truncate font-medium text-foreground">{c.label}</span>
              ) : (
                <Link
                  to={c.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Current page only on small screens — breadcrumb trail is redundant with the drawer */}
        <span className="min-w-0 truncate text-[14px] font-semibold text-foreground md:hidden">
          {crumbs[crumbs.length - 1].label}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 rounded-md border bg-surface px-2 py-1 text-[11px] font-medium ${environment.chipClassName}`}
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
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
