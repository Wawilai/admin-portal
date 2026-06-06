function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_ADMIN_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    const isLocalHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]";

    if (!isLocalHost) {
      return "/admin-api";
    }
  }

  return "http://localhost:8900/admin-api";
}

export const API_BASE_URL = resolveApiBaseUrl();
export const ADMIN_UNAUTHORIZED_EVENT = "admin-api-unauthorized";

let csrfToken = "";

export function setApiCsrfToken(value: string) {
  csrfToken = value;
}

function notifyUnauthorized() {
  window.dispatchEvent(new CustomEvent(ADMIN_UNAUTHORIZED_EVENT));
}

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(message: string, status: number, detail = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function extractDetail(response: Response): Promise<string> {
  try {
    const data = (await response.clone().json()) as { detail?: unknown };
    if (typeof data?.detail === "string" && data.detail.trim()) {
      return data.detail.trim();
    }
  } catch {
    // ignore non-json bodies
  }
  return "";
}

async function handleResponse<T>(
  response: Response,
  method: string,
  path: string,
): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized();
    }
    const detail = await extractDetail(response);
    throw new ApiError(`${method} ${path} failed`, response.status, detail);
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  return handleResponse<T>(response, "GET", path);
}

export async function apiWrite<T>(
  path: string,
  body: unknown,
  method: "POST" | "PATCH" | "DELETE" = "POST",
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-Admin-Csrf-Token": csrfToken } : {}),
    },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response, method, path);
}

export function buildApiPath(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!params) {
    return path;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function extractErrorDetail(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.detail) {
    return error.detail;
  }
  return fallback;
}
