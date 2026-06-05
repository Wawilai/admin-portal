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

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
    throw new ApiError(`GET ${path} failed`, response.status);
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
    throw new ApiError(`${method} ${path} failed`, response.status);
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };
