const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_BASE_URL ?? "http://localhost:8900/admin-api";
let csrfToken = "";
export const ADMIN_UNAUTHORIZED_EVENT = "admin-api-unauthorized";

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
    // non-JSON body — ignore
  }
  return "";
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized();
    }
    const detail = await extractDetail(response);
    throw new ApiError(`GET ${path} failed`, response.status, detail);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  method: "POST" | "PATCH" | "DELETE" = "POST",
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(csrfToken ? { "X-Admin-Csrf-Token": csrfToken } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      notifyUnauthorized();
    }
    const detail = await extractDetail(response);
    throw new ApiError(`${method} ${path} failed`, response.status, detail);
  }

  return (await response.json()) as T;
}

/** Extract the `detail` string from an ApiError, or fall back to a default message. */
export function extractErrorDetail(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.detail) {
    return error.detail;
  }
  return fallback;
}

export { API_BASE_URL };
