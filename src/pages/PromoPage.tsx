import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PaginationBar } from "../components/ui/PaginationBar";
import { PageHeader } from "../components/ui/PageHeader";
import { apiGet, apiPost } from "../lib/api";
import { useToast } from "../features/feedback/ToastContext";
import {
  buildPaginatedPath,
  parsePageParam,
  parsePageSizeParam,
} from "../lib/pagination";
import type { PaginatedResponse, PromoCodeRow } from "../lib/types";

export function PromoPage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const [code, setCode] = useState("");
  const [days, setDays] = useState("10");
  const [selectedCodeIds, setSelectedCodeIds] = useState<number[]>([]);
  const [confirmState, setConfirmState] = useState<
    | { kind: "single-deactivate"; codeIds: number[] }
    | { kind: "bulk-deactivate"; codeIds: number[] }
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
  const promoQuery = useQuery({
    queryKey: ["promo-codes", preset, sortBy, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<PromoCodeRow>>(
        buildPaginatedPath("/promo/codes", {
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
      apiPost<{ ok: boolean }>("/promo/codes", {
        code,
        description: "",
        discountType: "free_days",
        discountValue: Number(days),
        maxUses: 1,
        expiresInDays: 0,
      }),
    onSuccess: async () => {
      setCode("");
      setDays("10");
      showSuccess("Promo code created successfully.");
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: () => {
      showError("Unable to create promo code right now.");
    },
  });
  const deactivateMutation = useMutation({
    mutationFn: (id: number) =>
      apiPost<{ ok: boolean }>(`/promo/codes/${id}/deactivate`, {}),
    onSuccess: async () => {
      showSuccess("Promo code deactivated.");
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: () => {
      showError("Unable to deactivate promo code right now.");
    },
  });
  const bulkDeactivateMutation = useMutation({
    mutationFn: (codeIds: number[]) =>
      apiPost<{ ok: boolean; affected: number }>("/promo/codes/bulk-deactivate", {
        codeIds,
      }),
    onSuccess: async (result) => {
      setSelectedCodeIds([]);
      showSuccess(`Deactivated ${result.affected} promo codes.`);
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: () => {
      showError("Unable to bulk deactivate promo codes right now.");
    },
  });

  // Clear selection whenever filter, sort, or page changes to prevent
  // operating on rows the user can no longer see.
  useEffect(() => {
    setSelectedCodeIds([]);
  }, [preset, sortBy, sortDir, page, pageSize]);

  const items = promoQuery.data?.items ?? [];
  const total = promoQuery.data?.total ?? 0;
  const hasResults = total > 0;
  const selectableCodeIds = items
    .filter((item) => item.active && item.id)
    .map((item) => item.id as number);
  const allVisibleSelected =
    selectableCodeIds.length > 0 &&
    selectableCodeIds.every((codeId) => selectedCodeIds.includes(codeId));

  function toggleCode(codeId: number) {
    setSelectedCodeIds((current) =>
      current.includes(codeId)
        ? current.filter((item) => item !== codeId)
        : [...current, codeId],
    );
  }

  function toggleVisibleCodes() {
    setSelectedCodeIds((current) => {
      if (allVisibleSelected) {
        return current.filter((codeId) => !selectableCodeIds.includes(codeId));
      }
      const merged = new Set([...current, ...selectableCodeIds]);
      return Array.from(merged);
    });
  }

  const confirmCount = confirmState?.codeIds.length ?? 0;
  const confirmPreview = confirmState?.codeIds.slice(0, 5).join(", ") ?? "";
  const confirmPending =
    bulkDeactivateMutation.isPending || deactivateMutation.isPending;

  function handleConfirmAction() {
    if (!confirmState) {
      return;
    }
    if (confirmState.kind === "bulk-deactivate") {
      bulkDeactivateMutation.mutate(confirmState.codeIds, {
        onSettled: () => setConfirmState(null),
      });
      return;
    }
    deactivateMutation.mutate(confirmState.codeIds[0], {
      onSettled: () => setConfirmState(null),
    });
  }

  return (
    <>
      <PageHeader
        title="Promo Codes"
        subtitle="Create, monitor, and shut down promo campaigns with entitlement visibility and abuse control."
        actions={
          <>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ preset: event.target.value, page: 1 })
              }
              value={preset}
            >
              <option value="all">All promo codes</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
              <option value="expiring_soon">Expiring soon</option>
              <option value="limited_use">Limited use</option>
            </select>
            <select
              className="text-input select-input"
              onChange={(event) =>
                updateParams({ sortBy: event.target.value, page: 1 })
              }
              value={sortBy}
            >
              <option value="expires_at">Sort: Expires</option>
              <option value="used_count">Sort: Redeemed</option>
              <option value="code">Sort: Code</option>
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

      {promoQuery.isLoading && !promoQuery.data ? (
        <LoadingSkeleton title="Loading promo codes" />
      ) : null}

      {promoQuery.isError ? (
        <div className="inline-alert">
          Unable to load promo codes right now. Try again in a moment.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => promoQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="table-panel">
        <div className="panel-header">
          <div className="panel-title">Create Promo Code</div>
          <div className="panel-subtitle">
            Fast path for free premium day campaigns.
          </div>
        </div>
        <div className="inline-form">
          <input
            className="text-input"
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Promo code"
            type="text"
            value={code}
          />
          <input
            className="text-input"
            onChange={(event) => setDays(event.target.value)}
            placeholder="Free days"
            type="number"
            value={days}
          />
          <button
            className="primary-button"
            disabled={createMutation.isPending || !code.trim()}
            onClick={() => createMutation.mutate()}
            type="button"
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      <div className="table-panel">
        {selectedCodeIds.length ? (
          <div className="bulk-action-bar">
            <div className="bulk-action-copy">
              {selectedCodeIds.length} promo codes selected
            </div>
            <div className="table-actions">
              <button
                className="ghost-button compact-button"
                disabled={bulkDeactivateMutation.isPending}
                onClick={() =>
                  setConfirmState({
                    kind: "bulk-deactivate",
                    codeIds: selectedCodeIds,
                  })
                }
                type="button"
              >
                {bulkDeactivateMutation.isPending ? "Deactivating..." : "Bulk Deactivate"}
              </button>
              <button
                className="ghost-button compact-button"
                onClick={() => setSelectedCodeIds([])}
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
                    onChange={() => toggleVisibleCodes()}
                    type="checkbox"
                  />
                </th>
                <th>Code</th>
                <th>Reward</th>
                <th>Redeemed</th>
                <th>Max Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((code) => (
                <tr key={code.code}>
                  <td>
                    {code.active && code.id ? (
                      <input
                        checked={selectedCodeIds.includes(code.id)}
                        className="row-checkbox"
                        onChange={() => toggleCode(code.id!)}
                        type="checkbox"
                      />
                    ) : (
                      <span className="table-meta">-</span>
                    )}
                  </td>
                  <td>{code.code}</td>
                  <td>{code.rewardLabel}</td>
                  <td>{code.usedCount}</td>
                  <td>{code.maxUses ?? "unlimited"}</td>
                  <td>{code.expiresAt ?? "none"}</td>
                  <td>{code.active ? "active" : "inactive"}</td>
                  <td>
                    {code.active && code.id ? (
                      <button
                        className="ghost-button compact-button"
                        onClick={() =>
                          setConfirmState({
                            kind: "single-deactivate",
                            codeIds: [code.id!],
                          })
                        }
                        type="button"
                      >
                        Deactivate
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            {hasResults
              ? "No promo codes are available on this page. Move to a previous page."
              : "No promo codes are available yet."}
          </div>
        )}
        {hasResults ? (
          <PaginationBar
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
            onPageSizeChange={(nextPageSize) =>
              updateParams({ page: 1, pageSize: nextPageSize })
            }
            page={promoQuery.data?.page ?? page}
            pageSize={promoQuery.data?.pageSize ?? pageSize}
            total={total}
          />
        ) : null}
      </div>

      {confirmState ? (
        <ConfirmDialog
          cancelLabel="Keep active"
          confirmLabel={
            confirmState.kind === "bulk-deactivate"
              ? `Deactivate ${confirmCount}`
              : "Deactivate"
          }
          danger
          description={
            <>
              <div>
                This will disable the selected promo codes so they can no longer be redeemed.
              </div>
              <div className="dialog-summary">
                Affected: {confirmCount} code{confirmCount === 1 ? "" : "s"}
              </div>
              <div className="dialog-summary">
                IDs: {confirmPreview}
                {confirmCount > 5 ? " ..." : ""}
              </div>
            </>
          }
          isPending={confirmPending}
          onCancel={() => setConfirmState(null)}
          onConfirm={handleConfirmAction}
          title={
            confirmState.kind === "bulk-deactivate"
              ? "Bulk deactivate promo codes?"
              : "Deactivate promo code?"
          }
        />
      ) : null}
    </>
  );
}
