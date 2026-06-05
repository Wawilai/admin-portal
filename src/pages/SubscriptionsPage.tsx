import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PaginationBar } from "../components/ui/PaginationBar";
import { PageHeader } from "../components/ui/PageHeader";
import { apiGet, apiPost } from "../lib/api";
import { useToast } from "../features/feedback/ToastContext";
import { formatDateTime } from "../lib/formatters";
import {
  buildPaginatedPath,
  parsePageParam,
  parsePageSizeParam,
} from "../lib/pagination";
import type { PaginatedResponse, SubscriptionRow } from "../lib/types";

export function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const [userId, setUserId] = useState("");
  const [productId, setProductId] = useState("premium_monthly");
  const [platform, setPlatform] = useState("manual");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [confirmState, setConfirmState] = useState<
    | { kind: "single-revoke"; userIds: string[] }
    | { kind: "single-delete"; userIds: string[] }
    | { kind: "bulk-revoke"; userIds: string[] }
    | null
  >(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const preset = searchParams.get("preset") ?? "all";
  const sortBy = searchParams.get("sortBy") ?? "expires_at";
  const sortDir = searchParams.get("sortDir") ?? "desc";
  const page = parsePageParam(searchParams.get("page"));
  const pageSize = parsePageSizeParam(searchParams.get("pageSize"));
  function updateParams(next: {
    page?: number;
    pageSize?: number;
    preset?: string;
    sortBy?: string;
    sortDir?: string;
  }) {
    const params = new URLSearchParams(searchParams);
    params.set("page", `${next.page ?? page}`);
    params.set("pageSize", `${next.pageSize ?? pageSize}`);
    params.set("preset", next.preset ?? preset);
    params.set("sortBy", next.sortBy ?? sortBy);
    params.set("sortDir", next.sortDir ?? sortDir);
    setSearchParams(params);
  }
  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", preset, sortBy, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<SubscriptionRow>>(
        buildPaginatedPath("/subscriptions", {
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
  const createMutation = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>("/subscriptions", {
        userId,
        productId,
        platform,
      }),
    onSuccess: async () => {
      setUserId("");
      showSuccess("Subscription granted successfully.");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => {
      showError("Unable to grant subscription right now.");
    },
  });
  const revokeMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      apiPost<{ ok: boolean }>(`/subscriptions/${targetUserId}/revoke`, {}),
    onSuccess: async () => {
      showSuccess("Subscription revoked.");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => {
      showError("Unable to revoke subscription right now.");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      apiPost<{ ok: boolean }>(`/subscriptions/${targetUserId}`, {}, "DELETE"),
    onSuccess: async () => {
      showSuccess("Subscription deleted.");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => {
      showError("Unable to delete subscription right now.");
    },
  });
  const bulkRevokeMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      apiPost<{ ok: boolean; affected: number }>("/subscriptions/bulk-revoke", {
        userIds,
      }),
    onSuccess: async (result) => {
      setSelectedUserIds([]);
      showSuccess(`Revoked ${result.affected} subscriptions.`);
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: () => {
      showError("Unable to bulk revoke subscriptions right now.");
    },
  });

  // Clear selection whenever filter, sort, or page changes to prevent
  // operating on rows the user can no longer see.
  useEffect(() => {
    setSelectedUserIds([]);
  }, [preset, sortBy, sortDir, page, pageSize]);

  const items = subscriptionsQuery.data?.items ?? [];
  const total = subscriptionsQuery.data?.total ?? 0;
  const hasResults = total > 0;
  const allSelectableIds = items.map((item) => item.userId);
  const allVisibleSelected =
    allSelectableIds.length > 0 &&
    allSelectableIds.every((userId) => selectedUserIds.includes(userId));

  function toggleUser(userId: string) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((item) => item !== userId)
        : [...current, userId],
    );
  }

  function toggleVisibleUsers() {
    setSelectedUserIds((current) => {
      if (allVisibleSelected) {
        return current.filter((userId) => !allSelectableIds.includes(userId));
      }
      const merged = new Set([...current, ...allSelectableIds]);
      return Array.from(merged);
    });
  }

  const confirmCount = confirmState?.userIds.length ?? 0;
  const confirmPreview = confirmState?.userIds.slice(0, 3).join(", ") ?? "";
  const isBulkConfirm = confirmState?.kind === "bulk-revoke";
  const isDeleteConfirm = confirmState?.kind === "single-delete";
  const confirmPending =
    bulkRevokeMutation.isPending || revokeMutation.isPending || deleteMutation.isPending;

  function handleConfirmAction() {
    if (!confirmState) {
      return;
    }
    if (confirmState.kind === "bulk-revoke") {
      bulkRevokeMutation.mutate(confirmState.userIds, {
        onSettled: () => setConfirmState(null),
      });
      return;
    }
    if (confirmState.kind === "single-revoke") {
      revokeMutation.mutate(confirmState.userIds[0], {
        onSettled: () => setConfirmState(null),
      });
      return;
    }
    deleteMutation.mutate(confirmState.userIds[0], {
      onSettled: () => setConfirmState(null),
    });
  }

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="Operate premium access, promo-derived access, trial state, and manual entitlement corrections."
        actions={
          <>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ preset: event.target.value, page: 1 })
              }
              value={preset}
            >
              <option value="all">All subscriptions</option>
              <option value="active">Active only</option>
              <option value="expired">Expired only</option>
              <option value="trial">Trial only</option>
              <option value="expiring_soon">Expiring soon</option>
            </select>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ sortBy: event.target.value, page: 1 })
              }
              value={sortBy}
            >
              <option value="expires_at">Sort: Expires</option>
              <option value="days_left">Sort: Days left</option>
              <option value="user">Sort: User</option>
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

      {subscriptionsQuery.isLoading && !subscriptionsQuery.data ? (
        <LoadingSkeleton title="Loading subscriptions" />
      ) : null}

      {subscriptionsQuery.isError ? (
        <div className="inline-alert">
          Unable to load subscriptions right now. Try again in a moment.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => subscriptionsQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-panel">
        <div className="panel-header">
          <div className="panel-title">Grant Subscription</div>
          <div className="panel-subtitle">
            Create or replace a subscription record for a user.
          </div>
        </div>
        <div className="inline-form">
          <input
            className="text-input"
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            type="text"
            value={userId}
          />
          <input
            className="text-input"
            onChange={(event) => setProductId(event.target.value)}
            placeholder="Product ID"
            type="text"
            value={productId}
          />
          <input
            className="text-input"
            onChange={(event) => setPlatform(event.target.value)}
            placeholder="Platform"
            type="text"
            value={platform}
          />
          <button
            className="primary-button"
            disabled={createMutation.isPending || !userId.trim()}
            onClick={() => createMutation.mutate()}
            type="button"
          >
            {createMutation.isPending ? "Saving..." : "Grant"}
          </button>
        </div>
      </div>

      <div className="table-panel">
        {selectedUserIds.length ? (
          <div className="bulk-action-bar">
            <div className="bulk-action-copy">
              {selectedUserIds.length} subscriptions selected
            </div>
            <div className="table-actions">
              <button
                className="ghost-button compact-button"
                disabled={bulkRevokeMutation.isPending}
                onClick={() =>
                  setConfirmState({
                    kind: "bulk-revoke",
                    userIds: selectedUserIds,
                  })
                }
                type="button"
              >
                {bulkRevokeMutation.isPending ? "Revoking..." : "Bulk Revoke"}
              </button>
              <button
                className="ghost-button compact-button"
                onClick={() => setSelectedUserIds([])}
                type="button"
              >
                Clear
              </button>
            </div>
          </div>
        ) : null}
        {items.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    checked={allVisibleSelected}
                    className="row-checkbox"
                    onChange={() => toggleVisibleUsers()}
                    type="checkbox"
                  />
                </th>
                <th>User</th>
                <th>Tier</th>
                <th>Source</th>
                <th>Expires</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.userId}>
                  <td>
                    <input
                      checked={selectedUserIds.includes(row.userId)}
                      className="row-checkbox"
                      onChange={() => toggleUser(row.userId)}
                      type="checkbox"
                    />
                  </td>
                  <td>
                    {row.email}
                    <div className="table-meta">{row.userId}</div>
                  </td>
                  <td>{row.tier}</td>
                  <td>{row.source}</td>
                  <td>{formatDateTime(row.expiresAt)}</td>
                  <td>{row.active ? "yes" : "no"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="ghost-button compact-button"
                        onClick={() =>
                          setConfirmState({
                            kind: "single-revoke",
                            userIds: [row.userId],
                          })
                        }
                        type="button"
                      >
                        Revoke
                      </button>
                      <button
                        className="ghost-button compact-button danger-button"
                        onClick={() =>
                          setConfirmState({
                            kind: "single-delete",
                            userIds: [row.userId],
                          })
                        }
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
        ) : (
          <div className="empty-state">
            {hasResults
              ? "No subscriptions are available on this page. Move to a previous page."
              : "No subscriptions have been recorded yet."}
          </div>
        )}
        {hasResults ? (
          <PaginationBar
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            onPageSizeChange={(nextPageSize) =>
              updateParams({ page: 1, pageSize: nextPageSize })
            }
            page={subscriptionsQuery.data?.page ?? page}
            pageSize={subscriptionsQuery.data?.pageSize ?? pageSize}
            total={total}
          />
        ) : null}
      </div>

      {confirmState ? (
        <ConfirmDialog
          cancelLabel="Keep as is"
          confirmLabel={
            isDeleteConfirm
              ? "Delete"
              : isBulkConfirm
                ? `Revoke ${confirmCount}`
                : "Revoke"
          }
          danger
          description={
            <>
              <div>
                {isDeleteConfirm
                  ? "This will permanently remove the subscription record."
                  : "This will end premium access immediately for the selected subscription records."}
              </div>
              <div className="dialog-summary">
                Affected: {confirmCount} record{confirmCount === 1 ? "" : "s"}
              </div>
              <div className="dialog-summary">
                Sample: {confirmPreview}
                {confirmCount > 3 ? " ..." : ""}
              </div>
            </>
          }
          isPending={confirmPending}
          onCancel={() => setConfirmState(null)}
          onConfirm={handleConfirmAction}
          title={
            isDeleteConfirm
              ? "Delete subscription record?"
              : isBulkConfirm
                ? "Bulk revoke subscriptions?"
                : "Revoke subscription?"
          }
        />
      ) : null}
    </>
  );
}
