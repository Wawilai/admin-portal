import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { AdminRole } from "../../lib/types";

const SESSION_STORAGE_KEY = "rerkdee-admin-session";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
}

interface SessionContextValue {
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  user: SessionUser | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function buildDemoUser(email: string): SessionUser {
  return {
    id: "admin_demo",
    email,
    displayName: "Operations Lead",
    role: "super_admin",
  };
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);

    if (raw) {
      try {
        setUser(JSON.parse(raw) as SessionUser);
      } catch {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    setIsBootstrapping(false);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      isAuthenticated: user !== null,
      isBootstrapping,
      user,
      signIn: (email: string) => {
        const nextUser = buildDemoUser(email);
        window.localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify(nextUser),
        );
        setUser(nextUser);
      },
      signOut: () => {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setUser(null);
      },
    }),
    [isBootstrapping, user],
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
