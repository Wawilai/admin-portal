import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

import {
  EmptyState,
  InlineAlert,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  PanelBody,
  PanelHeader,
  StatTile,
  StatusBadge,
  Toolbar,
  FilterChip,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
} from "@/components/ui-portal";
import { apiGet, apiWrite, buildApiPath, extractErrorDetail } from "@/lib/api";
import { formatDateOnly } from "@/lib/formatters";
import type { PaginatedResponse, SubscriptionRow } from "@/lib/types";

export const Route = createFileRoute("/_app/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscriptions - Rerkdee Admin" },
      {
        name: "description",
        content: "Manage premium access, trial grants, and manual revocations.",
      },
    ],
  }),
  component: SubscriptionsPage,
});

const PRESETS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "expired", label: "Expired" },
  { id: "trial", label: "Trial" },
  { id: "expiring_soon", label: "Expiring soon" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];
type SortKey = "expires_at" | "user" | "tier" | "days_left";
type SortDir = "asc" | "desc";

function statusBadge(row: SubscriptionRow) {
  if (row.tier.toLowerCase().includes("trial")) {
    return <StatusBadge variant="trial">Trial</StatusBadge>;
  }
  if (row.active) {
    return <StatusBadge variant="active">Active</StatusBadge>;
  }
  return <StatusBadge variant="expired">Inactive</StatusBadge>;
}

function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("expires_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [productId, setProductId] = useState("premium_monthly");
  const [platform, setPlatform] = useState("manual");
  const [tier, setTier] = useState("premium");
  const [durationDays, setDurationDays] = useState("30");
  const [expiresAt, setExpiresAt] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const subscriptionsQuery = useQuery({
    queryKey: ["subscriptions", search, preset, sortKey, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<SubscriptionRow>>(
        buildApiPath("/subscriptions", {
          search,
          preset,
          sort_by: sortKey,
          sort_dir: sortDir,
          page,
          page_size: pageSize,
        }),
      ),
  });

  useEffect(() => {
    setSelected([]);
  }, [page, preset, search, sortDir, sortKey]);

  const grantMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/subscriptions", {
        userId: userId.trim(),
        email: email.trim() || undefined,
        productId,
        platform,
        tier,
        durationDays: expiresAt ? undefined : Number(durationDays),
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      }),
    onSuccess: async () => {
      setFlash("Subscription granted.");
      setError(null);
      setUserId("");
      setEmail("");
      setTier("premium");
      setDurationDays("30");
      setExpiresAt("");
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to grant subscription."));
      setFlash(null);
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (targetUserId: string) =>
      apiWrite<{ ok: boolean }>(`/subscriptions/${targetUserId}/revoke`, {}),
    onSuccess: async () => {
      setFlash("Subscription revoked.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to revoke subscription."));
      setFlash(null);
    },
  });

  const bulkRevokeMutation = useMutation({
    mutationFn: (userIds: string[]) =>
      apiWrite<{ ok: boolean; affected: number }>("/subscriptions/bulk-revoke", {
        userIds,
      }),
    onSuccess: async (result) => {
      setFlash(`Revoked ${result.affected} subscriptions.`);
      setError(null);
      setSelected([]);
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to bulk revoke subscriptions."));
      setFlash(null);
    },
  });

  const rows = subscriptionsQuery.data?.items ?? [];
  const total = subscriptionsQuery.data?.total ?? 0;
  const sortValue = useMemo(() => `${sortKey}:${sortDir}`, [sortDir, sortKey]);
  const numericDuration = Number(durationDays);
  const effectiveDuration =
    Number.isFinite(numericDuration) && numericDuration > 0
      ? numericDuration
      : productId === "premium_yearly"
        ? 365
        : productId === "trial_10_days"
          ? 10
          : 30;
  const canGrant =
    userId.trim().length > 0 &&
    (Boolean(expiresAt) || (Number.isFinite(numericDuration) && numericDuration > 0));
  const accessSummary = tier === "trial" ? "Trial access" : "Premium access";
  const expirySummary = expiresAt
    ? new Date(expiresAt).toLocaleString()
    : `Auto-expires in ${effectiveDuration} days`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Subscriptions"
        subtitle="Grant, inspect, and revoke premium access."
        actions={
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {total.toLocaleString()} subscriptions
          </span>
        }
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}
      {subscriptionsQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load subscriptions">
          Check backend status or adjust the current filters and try again.
        </InlineAlert>
      ) : null}

      <Panel>
        <PanelHeader
          title="Grant subscription"
          description="Use presets for the most common support actions, then review the final expiry before saving."
        />
        <PanelBody className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatTile label="Access tier" value={accessSummary} />
            <StatTile label="Platform source" value={platform} />
            <StatTile label="Expiry plan" value={expirySummary} />
          </div>

          <div className="flex flex-wrap gap-2">
            <QuickActionButton
              label="Monthly premium"
              onClick={() => {
                setProductId("premium_monthly");
                setTier("premium");
                setPlatform("manual");
                setDurationDays("30");
                setExpiresAt("");
              }}
            />
            <QuickActionButton
              label="Yearly premium"
              onClick={() => {
                setProductId("premium_yearly");
                setTier("premium");
                setPlatform("manual");
                setDurationDays("365");
                setExpiresAt("");
              }}
            />
            <QuickActionButton
              label="10-day trial"
              onClick={() => {
                setProductId("trial_10_days");
                setTier("trial");
                setPlatform("promo");
                setDurationDays("10");
                setExpiresAt("");
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="User ID">
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="uid_001"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Email (optional)">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Product ID">
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="premium_monthly">premium_monthly</option>
                <option value="premium_yearly">premium_yearly</option>
                <option value="trial_10_days">trial_10_days</option>
                <option value="manual_override">manual_override</option>
              </select>
            </Field>
            <Field label="Platform">
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="manual">manual</option>
                <option value="promo">promo</option>
                <option value="ios">ios</option>
                <option value="android">android</option>
                <option value="stripe">stripe</option>
              </select>
            </Field>
            <Field label="Tier">
              <select
                value={tier}
                onChange={(event) => setTier(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="premium">premium</option>
                <option value="trial">trial</option>
              </select>
            </Field>
            <Field label="Duration days">
              <input
                type="number"
                min="1"
                max="3650"
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                disabled={Boolean(expiresAt)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
              />
            </Field>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <Field label="Explicit expiry (optional)">
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <div className="rounded-md border border-border bg-card px-4 py-3 text-sm leading-6 text-muted-foreground">
              Use an explicit expiry when support is restoring a purchase or matching an external entitlement. If this stays empty, the subscription uses the duration above.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <QuickActionButton
              label="Apply product defaults"
              onClick={() => {
                if (productId === "premium_yearly") {
                  setTier("premium");
                  setDurationDays("365");
                } else if (productId === "trial_10_days") {
                  setTier("trial");
                  setDurationDays("10");
                } else {
                  setTier("premium");
                  setDurationDays("30");
                }
                setExpiresAt("");
              }}
            />
            <button
              type="button"
              onClick={() => grantMutation.mutate()}
              disabled={grantMutation.isPending || !canGrant}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {grantMutation.isPending ? "Saving..." : "Grant subscription"}
            </button>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader
          title="Current subscriptions"
          description="Search, filter, and revoke existing access without leaving the page."
        />
        <PanelBody className="px-0 py-0">
          <Toolbar
            left={
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search email or user ID"
                    className="h-8 w-72 rounded-md border border-border bg-background pl-7 pr-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
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
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  Sort
                  <div className="relative">
                    <select
                      value={sortValue}
                      onChange={(event) => {
                        const [nextKey, nextDir] = event.target.value.split(":") as [
                          SortKey,
                          SortDir,
                        ];
                        setSortKey(nextKey);
                        setSortDir(nextDir);
                        setPage(1);
                      }}
                      className="h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-[12px] font-medium text-foreground outline-none transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/40"
                    >
                      <option value="expires_at:desc">Expiry · latest</option>
                      <option value="expires_at:asc">Expiry · soonest</option>
                      <option value="days_left:asc">Days left · low to high</option>
                      <option value="days_left:desc">Days left · high to low</option>
                      <option value="user:asc">User · A→Z</option>
                      <option value="user:desc">User · Z→A</option>
                      <option value="tier:asc">Tier · A→Z</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>
                {selected.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => bulkRevokeMutation.mutate(selected)}
                    disabled={bulkRevokeMutation.isPending}
                    className="inline-flex h-8 items-center rounded-md border border-destructive/40 bg-destructive/10 px-3 text-[12px] font-medium text-destructive hover:bg-destructive/15 disabled:opacity-50"
                  >
                    {bulkRevokeMutation.isPending ? "Revoking..." : `Revoke ${selected.length}`}
                  </button>
                ) : (
                  <span className="text-[12px] text-muted-foreground tabular-nums">
                    {total} subscriptions
                  </span>
                )}
              </div>
            }
          />

          {subscriptionsQuery.isLoading ? (
            <div className="p-5">
              <LoadingSkeleton className="h-44" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="No subscriptions"
                description="No rows match the current filters."
              />
            </div>
          ) : (
            <DataTable>
              <THead>
                <TR>
                  <TH className="w-10">Sel</TH>
                  <TH>User</TH>
                  <TH>Tier</TH>
                  <TH>Source</TH>
                  <TH>Expires</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => {
                  const checked = selected.includes(row.userId);
                  return (
                    <TR key={row.userId} selected={checked}>
                      <TD>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelected((current) =>
                              checked
                                ? current.filter((item) => item !== row.userId)
                                : [...current, row.userId],
                            )
                          }
                        />
                      </TD>
                      <TD>
                        <div className="font-medium text-foreground">{row.email}</div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {row.userId}
                        </div>
                      </TD>
                      <TD>{row.tier}</TD>
                      <TD className="text-muted-foreground">{row.source}</TD>
                      <TD className="text-muted-foreground">{formatDateOnly(row.expiresAt)}</TD>
                      <TD>{statusBadge(row)}</TD>
                      <TD className="text-right">
                        <button
                          type="button"
                          onClick={() => revokeMutation.mutate(row.userId)}
                          className="inline-flex h-7 items-center rounded-md border border-border bg-card px-2 text-[11px] text-foreground hover:bg-muted"
                        >
                          Revoke
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </DataTable>
          )}

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </PanelBody>
      </Panel>
    </div>
  );
}

function QuickActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-[12px] font-medium text-foreground hover:bg-muted"
    >
      {label}
    </button>
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
