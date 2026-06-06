import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  ADMIN_UNAUTHORIZED_EVENT,
  ApiError,
  apiGet,
  apiWrite,
  setApiCsrfToken,
} from "@/lib/api";
import type { AdminSessionUser, AuthMeResponse } from "@/lib/types";

interface SessionContextValue {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrapFailed: boolean;
  defaultRoute: string;
  permissions: string[];
  user: AdminSessionUser | null;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const permissionRouteOrder = [
  { permission: "dashboard.read", route: "/" },
  { permission: "users.read", route: "/users" },
  { permission: "credits.read", route: "/credits" },
  { permission: "subscriptions.read", route: "/subscriptions" },
  { permission: "promo.read", route: "/promo" },
  { permission: "ai.read", route: "/ai-ops" },
  { permission: "ai.read", route: "/ai-usage" },
  { permission: "config.read", route: "/remote-config" },
  { permission: "audit.read", route: "/audit-log" },
  { permission: "admin_users.read", route: "/admin-users" },
];

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapFailed, setBootstrapFailed] = useState(false);

  const refreshSession = useCallback(async () => {
    setIsBootstrapping(true);
    setBootstrapFailed(false);

    try {
      const result = await apiGet<AuthMeResponse>("/auth/me");
      setUser(result.user);
      setPermissions(result.permissions);
      setApiCsrfToken(result.csrfToken);
    } catch (error) {
      const unauthenticated =
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403);
      setUser(null);
      setPermissions([]);
      setApiCsrfToken("");
      setBootstrapFailed(!unauthenticated);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setPermissions([]);
      setApiCsrfToken("");
    };

    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isBootstrapping,
      bootstrapFailed,
      permissions,
      user,
      refreshSession,
      defaultRoute:
        permissionRouteOrder.find(
          (item) =>
            permissions.includes("*") || permissions.includes(item.permission),
        )?.route ?? "/",
      hasPermission: (permission: string) =>
        permissions.includes("*") || permissions.includes(permission),
      signIn: async (username: string, password: string) => {
        await apiWrite<{ ok: boolean }>("/auth/login", { username, password });
        const result = await apiGet<AuthMeResponse>("/auth/me");
        setUser(result.user);
        setPermissions(result.permissions);
        setApiCsrfToken(result.csrfToken);
      },
      signOut: async () => {
        await apiWrite<{ ok: boolean }>("/auth/logout", {});
        setUser(null);
        setPermissions([]);
        setApiCsrfToken("");
      },
    }),
    [bootstrapFailed, isBootstrapping, permissions, refreshSession, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
