import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { LoadingSkeleton } from "@/components/ui-portal";
import { useSession } from "@/features/auth/SessionContext";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

function AppShell() {
  const {
    defaultRoute,
    hasPermission,
    isAuthenticated,
    isBootstrapping,
    bootstrapFailed,
    refreshSession,
  } =
    useSession();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const permissionMap: Array<{ match: (path: string) => boolean; permission: string }> = [
    { match: (path) => path === "/" || path === "", permission: "dashboard.read" },
    { match: (path) => path.startsWith("/users"), permission: "users.read" },
    { match: (path) => path.startsWith("/credits"), permission: "credits.read" },
    { match: (path) => path.startsWith("/subscriptions"), permission: "subscriptions.read" },
    { match: (path) => path.startsWith("/promo"), permission: "promo.read" },
    { match: (path) => path.startsWith("/ai-ops"), permission: "dashboard.read" },
    { match: (path) => path.startsWith("/notifications"), permission: "notifications.read" },
    { match: (path) => path.startsWith("/remote-config"), permission: "config.read" },
    { match: (path) => path.startsWith("/audit-log"), permission: "audit.read" },
    { match: (path) => path.startsWith("/admin-users"), permission: "admin_users.read" },
  ];
  const requiredPermission = permissionMap.find((item) => item.match(pathname))?.permission;

  useEffect(() => {
    if (!bootstrapFailed && !isBootstrapping && !isAuthenticated) {
      window.location.replace("/login");
      return;
    }

    if (
      !bootstrapFailed &&
      requiredPermission &&
      !hasPermission(requiredPermission)
    ) {
      window.location.replace(defaultRoute);
    }
  }, [
    bootstrapFailed,
    defaultRoute,
    hasPermission,
    isAuthenticated,
    isBootstrapping,
    requiredPermission,
  ]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-xl">
          <LoadingSkeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (bootstrapFailed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <div className="max-w-md">
          <p className="text-eyebrow text-destructive">Session</p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
            Unable to restore your session
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The admin API could not be reached. Check backend status and try again.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            Current API base: <code>{API_BASE_URL}</code>
          </p>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => {
                void refreshSession();
              }}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Retry session check
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bootstrapFailed && !isAuthenticated) {
    return null;
  }

  if (
    !bootstrapFailed &&
    requiredPermission &&
    !hasPermission(requiredPermission)
  ) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
