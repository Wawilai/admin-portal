import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

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
import type { PaginatedResponse, UserSummary } from "../lib/types";

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const preset = searchParams.get("preset") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "last_active";
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
    const nextPageSize = next.pageSize ?? pageSize;
    const nextPage = next.page ?? page;
    const nextPreset = next.preset ?? preset;
    const nextSortBy = next.sortBy ?? sortBy;
    const nextSortDir = next.sortDir ?? sortDir;

    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }
    params.set("page", `${nextPage}`);
    params.set("pageSize", `${nextPageSize}`);
    params.set("preset", nextPreset);
    params.set("sortBy", nextSortBy);
    params.set("sortDir", nextSortDir);
    setSearchParams(params);
  }

  const usersQuery = useQuery({
    queryKey: ["users", search, preset, sortBy, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<UserSummary>>(
        buildPaginatedPath("/users", {
          search,
          page,
          pageSize,
          extraParams: {
            preset,
            sort_by: sortBy,
            sort_dir: sortDir,
          },
        }),
      ),
  });

  const items = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
  const hasResults = total > 0;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="This list is the entry point to User 360, support actions, and entitlement debugging."
        actions={
          <>
            <input
              className="text-input search-input"
              onChange={(event) => {
                updateParams({ search: event.target.value, page: 1 });
              }}
              placeholder="Search by email or user id"
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
              <option value="all">All users</option>
              <option value="premium">Premium</option>
              <option value="trial">Trial</option>
              <option value="free">Free</option>
              <option value="credits">With credits</option>
            </select>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ sortBy: event.target.value, page: 1 })
              }
              value={sortBy}
            >
              <option value="last_active">Sort: Last active</option>
              <option value="credits">Sort: Credits</option>
              <option value="email">Sort: Email</option>
              <option value="tier">Sort: Tier</option>
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

      {usersQuery.isLoading && !usersQuery.data ? (
        <LoadingSkeleton title="Loading users" />
      ) : null}

      {usersQuery.isError ? (
        <div className="inline-alert">
          Unable to load users right now. Adjust your search or try again in a moment.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => usersQuery.refetch()}
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
                <th>User</th>
                <th>Tier</th>
                <th>Credits</th>
                <th>Remaining Today</th>
                <th>Locale</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <Link className="table-link" to={`/users/${user.userId}`}>
                      {user.email}
                    </Link>
                    <div className="table-meta">{user.userId}</div>
                  </td>
                  <td>{user.tier}</td>
                  <td>{user.credits}</td>
                  <td>{user.remainingToday}</td>
                  <td>{user.locale}</td>
                  <td>{formatDateTime(user.lastActiveAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            {hasResults
              ? "No users are available on this page. Move to a previous page."
              : "No users matched this search yet."}
          </div>
        )}
        {hasResults ? (
          <PaginationBar
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            onPageSizeChange={(nextPageSize) =>
              updateParams({ page: 1, pageSize: nextPageSize })
            }
            page={usersQuery.data?.page ?? page}
            pageSize={usersQuery.data?.pageSize ?? pageSize}
            total={total}
          />
        ) : null}
      </div>
    </>
  );
}
