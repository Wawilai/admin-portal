interface PaginatedPathOptions {
  page: number;
  pageSize: number;
  search?: string;
  extraParams?: Record<string, string | number | undefined | null>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function buildPaginatedPath(
  path: string,
  { page, pageSize, search, extraParams }: PaginatedPathOptions,
) {
  const params = new URLSearchParams();
  params.set("page", `${page}`);
  params.set("page_size", `${pageSize}`);

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  Object.entries(extraParams ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || `${value}`.trim() === "") {
      return;
    }
    params.set(key, `${value}`);
  });

  return `${path}?${params.toString()}`;
}

export function parsePageParam(value: string | null, fallback = DEFAULT_PAGE) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

export function parsePageSizeParam(
  value: string | null,
  fallback = DEFAULT_PAGE_SIZE,
) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(MAX_PAGE_SIZE, Math.floor(parsed));
}
