import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Coins,
  CreditCard,
  Ticket,
  Sparkles,
  Activity,
  Bell,
  SlidersHorizontal,
  ScrollText,
  ShieldCheck,
  KeyRound,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Users2,
} from "lucide-react";
import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { useSession } from "@/features/auth/SessionContext";
import { getEnvironmentBadge } from "@/lib/environment";

const COLLAPSE_STORAGE_KEY = "rerkdee-admin-sidebar-collapsed";

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return [collapsed, setCollapsed] as const;
}

export type NavItem = {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  permission: string;
  match?: (pathname: string) => boolean;
};

export const NAV: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, permission: "dashboard.read", match: (p) => p === "/" },
  { label: "Users", to: "/users", icon: Users, permission: "users.read", match: (p) => p.startsWith("/users") },
  { label: "Credits", to: "/credits", icon: Coins, permission: "credits.read" },
  { label: "Subscriptions", to: "/subscriptions", icon: CreditCard, permission: "subscriptions.read" },
  { label: "Purchases", to: "/purchases", icon: ReceiptText, permission: "purchases.read" },
  { label: "Promo", to: "/promo", icon: Ticket, permission: "promo.read" },
  { label: "Referrals", to: "/referrals", icon: Users2, permission: "referrals.read" },
  { label: "AI Ops", to: "/ai-ops", icon: Sparkles, permission: "ai.read" },
  { label: "AI Usage", to: "/ai-usage", icon: Activity, permission: "ai.read" },
  { label: "Notifications", to: "/notifications", icon: Bell, permission: "notifications.read" },
  { label: "Feature Access", to: "/feature-access", icon: KeyRound, permission: "config.read" },
  { label: "Remote Config", to: "/remote-config", icon: SlidersHorizontal, permission: "config.read" },
  { label: "Audit Log", to: "/audit-log", icon: ScrollText, permission: "audit.read" },
  { label: "Admin Users", to: "/admin-users", icon: ShieldCheck, permission: "admin_users.read" },
];

/** Shared brand + nav + operator footer, reused by the desktop rail and the mobile drawer. */
export function SidebarContent({
  onNavigate,
  collapsed = false,
  onToggleCollapsed,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { hasPermission, user } = useSession();
  const visibleNav = NAV.filter((item) => hasPermission(item.permission));
  const environment = getEnvironmentBadge();

  return (
    <div className="flex h-full flex-col">
      <div
        className={
          "flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-4 " +
          (collapsed ? "justify-center px-2" : "")
        }
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
          R
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-sidebar-foreground">Rerkdee</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Admin Portal
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && <p className="px-3 pb-2 text-eyebrow">Workspace</p>}
        <ul className="flex flex-col gap-0.5">
          {visibleNav.map((item) => {
            const active = item.match ? item.match(pathname) : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={
                    "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors md:py-1.5 " +
                    (collapsed ? "justify-center px-0" : "") +
                    (active
                      ? " bg-sidebar-accent text-sidebar-accent-foreground"
                      : " text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground")
                  }
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary" />
                  )}
                  <Icon className="h-4 w-4 shrink-0 opacity-80" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {onToggleCollapsed && (
        <div className="hidden shrink-0 border-t border-sidebar-border p-2 md:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={
              "flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground " +
              (collapsed ? "justify-center px-0" : "")
            }
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={
          "shrink-0 border-t border-sidebar-border p-3 " + (collapsed ? "flex justify-center" : "")
        }
      >
        {collapsed ? (
          <div
            title={`${user?.email ?? "operator@rerkdee.app"} · ${user?.role ?? "Unknown"}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
          >
            {user?.displayName?.slice(0, 2).toUpperCase() ?? "OP"}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {user?.displayName?.slice(0, 2).toUpperCase() ?? "OP"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-sidebar-foreground">
                  {user?.email ?? "operator@rerkdee.app"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {user?.role ?? "Unknown"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md border border-sidebar-border bg-background/40 px-2.5 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Environment
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${environment.chipClassName}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${environment.dotClassName}`} />
                {environment.label}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  return (
    <aside
      className={
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 md:flex " +
        (collapsed ? "w-16" : "w-60")
      }
    >
      <SidebarContent collapsed={collapsed} onToggleCollapsed={() => setCollapsed((v) => !v)} />
    </aside>
  );
}
