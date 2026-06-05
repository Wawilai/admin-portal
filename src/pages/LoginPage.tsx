import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useSession } from "../features/auth/SessionContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useSession();
  const [email, setEmail] = useState("ops@example.com");
  const [password, setPassword] = useState("demo-password");

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
    void password;
    signIn(email);
    navigate(nextPath, { replace: true });
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
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            value={email}
          />
          <input
            className="text-input"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
          <button className="primary-button wide" type="submit">
            Sign in
          </button>
        </form>
        <div className="login-note">
          Demo scaffold: the local auth shell stores a session in browser
          storage until the backend `admin-api` session is wired in.
        </div>
      </div>
    </div>
  );
}
