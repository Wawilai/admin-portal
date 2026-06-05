import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  ADMIN_UNAUTHORIZED_EVENT,
  ApiError,
  apiGet,
  apiPost,
  setApiCsrfToken,
} from "../../lib/api";
import type { AdminSessionUser, AuthMeResponse } from "../../lib/types";

interface SessionContextValue {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  bootstrapFailed: boolean;
  defaultRoute: string;
  hasPermission: (permission: string) => boolean;
  permissions: string[];
  user: AdminSessionUser | null;
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
  { permission: "audit.read", route: "/audit-log" },
  { permission: "admin_users.read", route: "/admin-users" },
];

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapFailed, setBootstrapFailed] = useState(false);

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
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const result = await apiGet<AuthMeResponse>("/auth/me");
        if (isMounted) {
          setUser(result.user);
          setPermissions(result.permissions);
          setApiCsrfToken(result.csrfToken);
        }
      } catch (error) {
        const isUnauthenticated =
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403);
        if (!isUnauthenticated) {
          console.error("Failed to bootstrap admin session", error);
        }
        if (isMounted) {
          setUser(null);
          setPermissions([]);
          setApiCsrfToken("");
          setBootstrapFailed(!isUnauthenticated);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isBootstrapping,
      bootstrapFailed,
      defaultRoute:
        permissionRouteOrder.find(
          (item) =>
            permissions.includes("*") || permissions.includes(item.permission),
        )?.route ?? "/login",
      hasPermission: (permission: string) =>
        permissions.includes("*") || permissions.includes(permission),
      permissions,
      user,
      signIn: async (username: string, password: string) => {
        await apiPost<{ ok: boolean }>("/auth/login", { username, password });
        const result = await apiGet<AuthMeResponse>("/auth/me");
        setUser(result.user);
        setPermissions(result.permissions);
        setApiCsrfToken(result.csrfToken);
      },
      signOut: async () => {
        await apiPost<{ ok: boolean }>("/auth/logout", {});
        setUser(null);
        setPermissions([]);
        setApiCsrfToken("");
      },
    }),
    [bootstrapFailed, isBootstrapping, permissions, user],
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
