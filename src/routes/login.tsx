import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { InlineAlert } from "@/components/ui-portal";
import { useSession } from "@/features/auth/SessionContext";
import { extractErrorDetail } from "@/lib/api";
import { getEnvironmentBadge } from "@/lib/environment";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Rerkdee Admin" },
      {
        name: "description",
        content: "Operator access to the Rerkdee Admin Portal.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const { defaultRoute, isAuthenticated, isBootstrapping, signIn } = useSession();
  const environment = getEnvironmentBadge();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      if (window.location.pathname !== defaultRoute) {
        window.location.replace(defaultRoute);
      }
    }
  }, [defaultRoute, isAuthenticated, isBootstrapping]);

  if (!isBootstrapping && isAuthenticated) {
    return null;
  }

  function detectCapsLock(e: React.KeyboardEvent<HTMLInputElement>) {
    const state = e.getModifierState && e.getModifierState("CapsLock");
    setCapsLock(Boolean(state));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      await signIn(username.trim(), password);
      if (window.location.pathname !== defaultRoute) {
        window.location.replace(defaultRoute);
      }
    } catch (err) {
      setError(extractErrorDetail(err, "Sign-in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Subtle background grid — restrained, no decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* Top utility bar — environment chip, no marketing chrome */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            R
          </div>
          <span className="text-sm font-semibold text-foreground">Rerkdee</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Admin Portal
          </span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border bg-surface px-2 py-1 text-[11px] font-medium ${environment.chipClassName}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${environment.dotClassName}`} />
          {environment.label}
        </span>
      </header>

      {/* Centered, compact sign-in surface */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[380px]">
          <div className="rounded-lg border border-border bg-card/60 p-6 backdrop-blur">
            {/* Heading */}
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Internal access
            </div>
            <h1 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              Sign in to continue
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Operator credentials only. Sessions are cookie-bound and recorded
              in the audit log.
            </p>

            {/* Form */}
            <form
              onSubmit={onSubmit}
              className="mt-5 flex flex-col gap-3"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="username"
                  className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Username
                </label>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  autoCapitalize="none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                  {capsLock && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-warning">
                      Caps lock
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={detectCapsLock}
                    onKeyUp={detectCapsLock}
                    disabled={loading}
                    required
                    className="h-9 w-full rounded-md border border-input bg-background pl-3 pr-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <InlineAlert variant="danger" title="Sign-in failed">
                  {error}
                </InlineAlert>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Unauthorized access is prohibited and monitored.
          </p>
        </div>
      </main>
    </div>
  );
}
