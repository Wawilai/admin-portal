import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PageHeader,
  Panel,
  PanelHeader,
  PanelBody,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  Pagination,
  EmptyState,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { apiGet, apiWrite, buildApiPath, extractErrorDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { AdminRole, AdminUserRow, PaginatedResponse } from "@/lib/types";

export const Route = createFileRoute("/_app/admin-users")({
  head: () => ({
    meta: [
      { title: "Admin Users — Rerkdee Admin" },
      {
        name: "description",
        content: "Manage internal operators, roles, and access.",
      },
    ],
  }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("analyst");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const usersQuery = useQuery({
    queryKey: ["admin-users", page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<AdminUserRow>>(
        buildApiPath("/admin-users", { page, page_size: pageSize }),
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/admin-users", {
        username: username.trim(),
        password,
        role,
      }),
    onSuccess: async () => {
      setFlash("Admin user created.");
      setError(null);
      setUsername("");
      setPassword("");
      setRole("analyst");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to create admin user."));
      setFlash(null);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      apiWrite<{ ok: boolean }>(`/admin-users/${userId}/password`, { newPassword }),
    onSuccess: () => {
      setFlash("Password changed.");
      setError(null);
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to change password."));
      setFlash(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) =>
      apiWrite<{ ok: boolean }>(`/admin-users/${userId}`, {}, "DELETE"),
    onSuccess: async () => {
      setFlash("Admin user deleted.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to delete admin user."));
      setFlash(null);
    },
  });

  const rows = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Admin users" subtitle="Manage internal operators and credentials." />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader title="Create admin user" description="Role and password are stored in the backend." />
          <PanelBody className="flex flex-col gap-4">
            <Field label="Username">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Role">
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="super_admin">super_admin</option>
                <option value="ops_admin">ops_admin</option>
                <option value="marketing_admin">marketing_admin</option>
                <option value="analyst">analyst</option>
              </select>
            </Field>
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create admin user"}
            </button>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Current admins" description="Operators returned by the admin API." />
          <PanelBody className="px-0 py-0">
            {usersQuery.isLoading ? (
              <div className="p-5">
                <LoadingSkeleton className="h-40" />
              </div>
            ) : rows.length === 0 ? (
              <div className="px-5 py-10">
                <EmptyState title="No admin users" description="No admin records were returned by the backend." />
              </div>
            ) : (
              <DataTable>
                <THead>
                  <TR>
                    <TH>ID</TH>
                    <TH>Username</TH>
                    <TH>Role</TH>
                    <TH>Created</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((row) => (
                    <TR key={row.id}>
                      <TD className="font-mono text-[12px]">{row.id}</TD>
                      <TD className="font-medium">{row.username}</TD>
                      <TD>{row.role}</TD>
                      <TD className="text-muted-foreground">{formatDateTime(row.createdAt)}</TD>
                      <TD className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newPassword = window.prompt(`New password for ${row.username}`);
                              if (newPassword) {
                                passwordMutation.mutate({ userId: row.id, newPassword });
                              }
                            }}
                            className="inline-flex h-7 items-center rounded-md border border-border bg-card px-2 text-[11px] text-foreground hover:bg-muted"
                          >
                            Password
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete admin user ${row.username}?`)) {
                                deleteMutation.mutate(row.id);
                              }
                            }}
                            className="inline-flex h-7 items-center rounded-md border border-destructive/40 bg-destructive/10 px-2 text-[11px] text-destructive hover:bg-destructive/15"
                          >
                            Delete
                          </button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </DataTable>
            )}
          </PanelBody>

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </Panel>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
