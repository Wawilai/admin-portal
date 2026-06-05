import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { PaginationBar } from "../components/ui/PaginationBar";
import { PageHeader } from "../components/ui/PageHeader";
import { apiGet } from "../lib/api";
import { formatDateTime } from "../lib/formatters";
import {
  buildPaginatedPath,
  parsePageParam,
  parsePageSizeParam,
} from "../lib/pagination";
import type { AuditRow, PaginatedResponse } from "../lib/types";

export function AuditLogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const preset = searchParams.get("preset") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "created_at";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const page = parsePageParam(searchParams.get("page"));
  const pageSize = parsePageSizeParam(searchParams.get("pageSize"));
  function updateParams(next: {
    page?: number;
    pageSize?: number;
    search?: string;
    preset?: string;
    sortBy?: string;
    sortDir?: string;
  }) {
    const params = new URLSearchParams(searchParams);
    const nextSearch = next.search ?? search;
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }
    params.set("page", `${next.page ?? page}`);
    params.set("pageSize", `${next.pageSize ?? pageSize}`);
    params.set("preset", next.preset ?? preset);
    params.set("sortBy", next.sortBy ?? sortBy);
    params.set("sortDir", next.sortDir ?? sortDir);
    setSearchParams(params);
  }
  const auditQuery = useQuery({
    queryKey: ["audit-log", search, preset, sortBy, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<AuditRow>>(
        buildPaginatedPath("/audit-log", {
          page,
          pageSize,
          search,
          extraParams: {
            preset,
            sort_by: sortBy,
            sort_dir: sortDir,
          },
        }),
      ),
  });

  const items = auditQuery.data?.items ?? [];
  const total = auditQuery.data?.total ?? 0;
  const hasResults = total > 0;

  return (
    <>
      <PageHeader
        title="Audit Log"
        subtitle="Every operator action that changes production state should land here with actor, target, and timestamp."
        actions={
          <>
            <input
              className="text-input search-input"
              onChange={(event) =>
                updateParams({ search: event.target.value, page: 1 })
              }
              placeholder="Search actor, action, or target"
              type="text"
              value={search}
            />
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ preset: event.target.value, page: 1 })
              }
              value={preset}
            >
              <option value="all">All actions</option>
              <option value="auth">Auth</option>
              <option value="credits">Credits</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="promo">Promo</option>
              <option value="config">Config and AI</option>
              <option value="admin_users">Admin users</option>
            </select>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ sortBy: event.target.value, page: 1 })
              }
              value={sortBy}
            >
              <option value="created_at">Sort: When</option>
              <option value="actor">Sort: Actor</option>
              <option value="action">Sort: Action</option>
            </select>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ sortDir: event.target.value, page: 1 })
              }
              value={sortDir}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </>
        }
      />

      {auditQuery.isLoading && !auditQuery.data ? (
        <LoadingSkeleton title="Loading audit log" />
      ) : null}

      {auditQuery.isError ? (
        <div className="inline-alert">
          Unable to load audit entries right now. Refresh to try again.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => auditQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-panel">
        {items.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Target</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{row.actor}</td>
                  <td>{row.role}</td>
                  <td>{row.action}</td>
                  <td>{row.target}</td>
                  <td>{formatDateTime(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            {hasResults
              ? "No audit entries are available on this page. Move to a previous page."
              : "No audit entries have been recorded yet."}
          </div>
        )}
        {hasResults ? (
          <PaginationBar
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            onPageSizeChange={(nextPageSize) =>
              updateParams({ page: 1, pageSize: nextPageSize })
            }
            page={auditQuery.data?.page ?? page}
            pageSize={auditQuery.data?.pageSize ?? pageSize}
            total={total}
          />
        ) : null}
      </div>
    </>
  );
}
