type AppEnvironment = "local" | "staging" | "production";

function normalizeEnvironment(value?: string | null): AppEnvironment | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "prod" || normalized === "production") {
    return "production";
  }
  if (normalized === "stage" || normalized === "staging") {
    return "staging";
  }
  if (normalized === "dev" || normalized === "development" || normalized === "local") {
    return "local";
  }
  return null;
}

export function getAppEnvironment(): AppEnvironment {
  const configured = normalizeEnvironment(import.meta.env.VITE_APP_ENV);
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
    ) {
      return "local";
    }

    if (
      hostname.includes("staging") ||
      hostname.includes("preview") ||
      hostname.includes("dev")
    ) {
      return "staging";
    }
  }

  return "production";
}

export function getEnvironmentBadge() {
  const environment = getAppEnvironment();

  if (environment === "local") {
    return {
      environment,
      label: "Local",
      dotClassName: "bg-warning",
      chipClassName: "border-warning/30 text-warning",
    };
  }

  if (environment === "staging") {
    return {
      environment,
      label: "Staging",
      dotClassName: "bg-info",
      chipClassName: "border-info/30 text-info",
    };
  }

  return {
    environment,
    label: "Production",
    dotClassName: "bg-success",
    chipClassName: "border-success/30 text-foreground",
  };
}
