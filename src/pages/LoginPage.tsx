import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ApiError } from "../lib/api";
import { useSession } from "../features/auth/SessionContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useSession();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("demo-password");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const nextPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, navigate, nextPath]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    void (async () => {
      try {
        await signIn(username, password);
        navigate(nextPath, { replace: true });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          setErrorMessage("Username or password is incorrect.");
        } else if (error instanceof ApiError && error.status === 429) {
          setErrorMessage("Too many login attempts. Please try again later.");
        } else {
          setErrorMessage("Unable to sign in right now.");
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-kicker">Rerkdee</div>
        <h1>Admin Portal</h1>
        <p>
          A standalone operations console for subscriptions, credits, AI usage,
          notifications, and user support.
        </p>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="text-input"
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            type="text"
            value={username}
          />
          <input
            className="text-input"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
          {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
          <button className="primary-button wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="login-note">
          This login now expects the backend admin session and `admin-api`
          routes to be running on the configured API base URL.
        </div>
      </div>
    </div>
  );
}
