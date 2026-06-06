import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PageHeader,
  Panel,
  PanelHeader,
  PanelBody,
  Toolbar,
  FilterChip,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  Pagination,
  StatusBadge,
  EmptyState,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { Search } from "lucide-react";
import { apiGet, apiWrite, buildApiPath, extractErrorDetail } from "@/lib/api";
import { formatDateOnly } from "@/lib/formatters";
import type { PaginatedResponse, PromoCodeRow } from "@/lib/types";

export const Route = createFileRoute("/_app/promo")({
  head: () => ({
    meta: [
      { title: "Promo codes — Rerkdee Admin" },
      {
        name: "description",
        content: "Create, inspect, and deactivate promo codes.",
      },
    ],
  }),
  component: PromoPage,
});

const PRESETS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "expired", label: "Expired" },
  { id: "deactivated", label: "Deactivated" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];

function PromoPage() {
  const queryClient = useQueryClient();
  const [preset, setPreset] = useState<Preset>("all");
  const [page, setPage] = useState(1);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("free_days");
  const [discountValue, setDiscountValue] = useState("30");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [selected, setSelected] = useState<number[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const promoQuery = useQuery({
    queryKey: ["promo-codes", preset, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<PromoCodeRow>>(
        buildApiPath("/promo/codes", {
          preset,
          page,
          page_size: pageSize,
        }),
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/promo/codes", {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        maxUses: Number(maxUses),
        expiresInDays: Number(expiresInDays),
      }),
    onSuccess: async () => {
      setFlash("Promo code created.");
      setError(null);
      setCode("");
      setDescription("");
      setDiscountType("free_days");
      setDiscountValue("30");
      setMaxUses("1");
      setExpiresInDays("30");
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to create promo code."));
      setFlash(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (codeId: number) =>
      apiWrite<{ ok: boolean }>(`/promo/codes/${codeId}/deactivate`, {}),
    onSuccess: async () => {
      setFlash("Promo code deactivated.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to deactivate promo code."));
      setFlash(null);
    },
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: (codeIds: number[]) =>
      apiWrite<{ ok: boolean; affected: number }>("/promo/codes/bulk-deactivate", {
        codeIds,
      }),
    onSuccess: async (result) => {
      setFlash(`Deactivated ${result.affected} promo codes.`);
      setError(null);
      setSelected([]);
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to bulk deactivate promo codes."));
      setFlash(null);
    },
  });

  const rows = promoQuery.data?.items ?? [];
  const total = promoQuery.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Promo codes" subtitle="Create and deactivate promo access codes." />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader title="Create promo code" description="Configure reward, usage limits, and expiry before launch." />
          <PanelBody className="flex flex-col gap-4">
            <Field label="Code">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="RERK001"
                className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Description">
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Campaign note or operator context"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Reward type">
              <select
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="free_days">free_days</option>
                <option value="discount_percent">discount_percent</option>
                <option value="credit_bonus">credit_bonus</option>
              </select>
            </Field>
            <Field label="Reward value">
              <input
                type="number"
                min="1"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Max uses">
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Expires in days">
              <input
                type="number"
                min="0"
                value={expiresInDays}
                onChange={(event) => setExpiresInDays(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <p className="text-[11px] leading-5 text-muted-foreground">
              Set max uses to <code>0</code> for unlimited redemption. Set expires in days to <code>0</code> for no expiry.
            </p>
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !code.trim()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create code"}
            </button>
          </PanelBody>
        </Panel>

        <Panel>
          <Toolbar
            left={
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value=""
                    readOnly
                    placeholder="Promo search is not yet supported by the backend"
                    className="h-8 w-72 rounded-md border border-border bg-background pl-7 pr-2.5 text-[13px] text-muted-foreground"
                  />
                </div>
                {PRESETS.map((item) => (
                  <FilterChip
                    key={item.id}
                    active={preset === item.id}
                    onClick={() => {
                      setPreset(item.id);
                      setPage(1);
                    }}
                  >
                    {item.label}
                  </FilterChip>
                ))}
              </>
            }
            right={
              selected.length > 0 ? (
                <button
                  type="button"
                  onClick={() => bulkDeactivateMutation.mutate(selected)}
                  disabled={bulkDeactivateMutation.isPending}
                  className="inline-flex h-8 items-center rounded-md border border-destructive/40 bg-destructive/10 px-3 text-[12px] font-medium text-destructive hover:bg-destructive/15 disabled:opacity-50"
                >
                  {bulkDeactivateMutation.isPending ? "Deactivating…" : `Deactivate ${selected.length}`}
                </button>
              ) : (
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {total} codes
                </span>
              )
            }
          />

          {promoQuery.isLoading ? (
            <div className="p-5">
              <LoadingSkeleton className="h-44" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState title="No promo codes" description="No promo codes match the current filters." />
            </div>
          ) : (
            <DataTable>
              <THead>
                <TR>
                  <TH className="w-10">Sel</TH>
                  <TH>Code</TH>
                  <TH>Reward</TH>
                  <TH className="text-right">Redeemed</TH>
                  <TH>Max uses</TH>
                  <TH>Expiry</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => {
                  const checked = row.id ? selected.includes(row.id) : false;
                  return (
                    <TR key={row.code} selected={checked}>
                      <TD>
                        {row.id ? (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelected((current) =>
                                checked
                                  ? current.filter((item) => item !== row.id)
                                  : [...current, row.id!],
                              )
                            }
                          />
                        ) : null}
                      </TD>
                      <TD className="font-mono">{row.code}</TD>
                      <TD>{row.rewardLabel}</TD>
                      <TD className="text-right tabular-nums">{row.usedCount}</TD>
                      <TD>{row.maxUses ?? "Unlimited"}</TD>
                      <TD className="text-muted-foreground">{formatDateOnly(row.expiresAt)}</TD>
                      <TD>
                        {row.active ? (
                          <StatusBadge variant="active">active</StatusBadge>
                        ) : (
                          <StatusBadge variant="expired">inactive</StatusBadge>
                        )}
                      </TD>
                      <TD className="text-right">
                        {row.id ? (
                          <button
                            type="button"
                            onClick={() => deactivateMutation.mutate(row.id!)}
                            disabled={!row.active}
                            className="inline-flex h-7 items-center rounded-md border border-border bg-card px-2 text-[11px] text-foreground hover:bg-muted disabled:opacity-40"
                          >
                            Deactivate
                          </button>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </DataTable>
          )}

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
