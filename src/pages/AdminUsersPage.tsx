import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { PaginationBar } from "../components/ui/PaginationBar";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../features/feedback/ToastContext";
import { apiGet, apiPost, extractErrorDetail } from "../lib/api";
import { formatDateTime } from "../lib/formatters";
import {
  buildPaginatedPath,
  parsePageParam,
  parsePageSizeParam,
} from "../lib/pagination";
import type { AdminRole, AdminUserRow, PaginatedResponse } from "../lib/types";

const roleOptions: AdminRole[] = [
  "super_admin",
  "ops_admin",
  "marketing_admin",
  "analyst",
];

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("analyst");
  const [passwordDrafts, setPasswordDrafts] = useState<Record<number, string>>({});
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

  const adminUsersQuery = useQuery({
    queryKey: ["admin-users", search, preset, sortBy, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<AdminUserRow>>(
        buildPaginatedPath("/admin-users", {
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

  const createMutation = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>("/admin-users", {
        username,
        password,
        role,
      }),
    onSuccess: async () => {
      setUsername("");
      setPassword("");
      setRole("analyst");
      showSuccess("Admin user created successfully.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      showError(extractErrorDetail(error, "Unable to create admin user right now."));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      apiPost<{ ok: boolean }>(`/admin-users/${userId}/password`, { newPassword }),
    onSuccess: async (_data, variables) => {
      setPasswordDrafts((current) => ({ ...current, [variables.userId]: "" }));
      showSuccess("Admin password updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      showError(extractErrorDetail(error, "Unable to update admin password right now."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiPost<{ ok: boolean }>(`/admin-users/${userId}`, {}, "DELETE"),
    onSuccess: async () => {
      showSuccess("Admin user deleted.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      showError(extractErrorDetail(error, "Unable to delete admin user right now."));
    },
  });

  const items = adminUsersQuery.data?.items ?? [];
  const total = adminUsersQuery.data?.total ?? 0;
  const hasResults = total > 0;

  return (
    <>
      <PageHeader
        title="Admin Users"
        subtitle="Manage administrator accounts, roles, and password rotations for the portal."
        actions={
          <>
            <input
              className="text-input search-input"
              onChange={(event) =>
                updateParams({ search: event.target.value, page: 1 })
              }
              placeholder="Search username or role"
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
              <option value="all">All roles</option>
              {roleOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ sortBy: event.target.value, page: 1 })
              }
              value={sortBy}
            >
              <option value="created_at">Sort: Created</option>
              <option value="username">Sort: Username</option>
              <option value="role">Sort: Role</option>
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

      {adminUsersQuery.isLoading && !adminUsersQuery.data ? (
        <LoadingSkeleton title="Loading admin users" />
      ) : null}

      {adminUsersQuery.isError ? (
        <div className="inline-alert">
          Unable to load admin users right now.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => adminUsersQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-panel">
        <div className="panel-header">
          <div className="panel-title">Create Admin User</div>
          <div className="panel-subtitle">
            Add a new administrator with an explicit role.
          </div>
        </div>
        <div className="inline-form">
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
          <select
            className="text-input select-input"
            onChange={(event) => setRole(event.target.value as AdminRole)}
            value={role}
          >
            {roleOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <button
            className="primary-button"
            disabled={createMutation.isPending || !username.trim() || password.length < 8}
            onClick={() => createMutation.mutate()}
            type="button"
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="table-panel">
        {items.length ? (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Password</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.username}</td>
                    <td>{item.role}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <input
                        className="text-input compact-input"
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        placeholder="New password"
                        type="password"
                        value={passwordDrafts[item.id] ?? ""}
                      />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="ghost-button compact-button"
                          disabled={(passwordDrafts[item.id] ?? "").length < 8}
                          onClick={() =>
                            passwordMutation.mutate({
                              userId: item.id,
                              newPassword: passwordDrafts[item.id] ?? "",
                            })
                          }
                          type="button"
                        >
                          Update Password
                        </button>
                        <button
                          className="ghost-button compact-button danger-button"
                          onClick={() => deleteMutation.mutate(item.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationBar
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
              onPageSizeChange={(nextPageSize) =>
                updateParams({ page: 1, pageSize: nextPageSize })
              }
              page={adminUsersQuery.data?.page ?? page}
              pageSize={adminUsersQuery.data?.pageSize ?? pageSize}
              total={total}
            />
          </>
        ) : (
          <>
            <div className="empty-state">
              {hasResults
                ? "No admin users are available on this page. Move to a previous page."
                : "No admin users have been created yet."}
            </div>
            {hasResults ? (
              <PaginationBar
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
                onPageSizeChange={(nextPageSize) =>
                  updateParams({ page: 1, pageSize: nextPageSize })
                }
                page={adminUsersQuery.data?.page ?? page}
                pageSize={adminUsersQuery.data?.pageSize ?? pageSize}
                total={total}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
