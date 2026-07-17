import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Field,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  PanelBody,
  PanelHeader,
  PromptDialog,
  RecordCard,
  RecordField,
  RecordList,
  Select,
  TBody,
  TD,
  TH,
  THead,
  TR,
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
  const [passwordTarget, setPasswordTarget] = useState<AdminUserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
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
      setPasswordTarget(null);
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
      setDeleteTarget(null);
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
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <Field label="Role">
              <Select value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>
                <option value="super_admin">super_admin</option>
                <option value="ops_admin">ops_admin</option>
                <option value="marketing_admin">marketing_admin</option>
                <option value="analyst">analyst</option>
              </Select>
            </Field>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating…" : "Create admin user"}
            </Button>
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
                          <Button size="sm" onClick={() => setPasswordTarget(row)}>
                            Password
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row)}>
                            Delete
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </DataTable>
            )}

            {!usersQuery.isLoading && rows.length > 0 ? (
              <RecordList>
                {rows.map((row) => (
                  <RecordCard key={row.id}>
                    <RecordField>
                      <span className="min-w-0 truncate font-medium text-foreground">{row.username}</span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{row.role}</span>
                    </RecordField>
                    <RecordField label="Created">{formatDateTime(row.createdAt)}</RecordField>
                    <div className="flex gap-2 border-t border-border/70 pt-2">
                      <Button size="sm" onClick={() => setPasswordTarget(row)}>
                        Password
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row)}>
                        Delete
                      </Button>
                    </div>
                  </RecordCard>
                ))}
              </RecordList>
            ) : null}
          </PanelBody>

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </Panel>
      </div>

      <PromptDialog
        open={passwordTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPasswordTarget(null);
        }}
        title={`New password for ${passwordTarget?.username ?? ""}`}
        label="New password"
        inputType="password"
        confirmLabel="Change password"
        isPending={passwordMutation.isPending}
        onConfirm={(newPassword) => {
          if (passwordTarget) {
            passwordMutation.mutate({ userId: passwordTarget.id, newPassword });
          }
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete admin user ${deleteTarget?.username ?? ""}?`}
        description="This cannot be undone. The operator will lose access immediately."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
      />
    </div>
  );
}
