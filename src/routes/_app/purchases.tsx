import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  PageHeader,
  Panel,
  Toolbar,
  FilterChip,
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
  StatusBadge,
  RecordList,
  RecordCard,
  RecordField,
} from "@/components/ui-portal";
import { Search, ReceiptText } from "lucide-react";
import { apiGet, buildApiPath } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { PaginatedResponse, PurchaseVerificationAttemptRow } from "@/lib/types";

export const Route = createFileRoute("/_app/purchases")({
  head: () => ({
    meta: [
      { title: "Purchases — Rerkdee Admin" },
      {
        name: "description",
        content:
          "Every Google Play purchase verification attempt — reconcile charges against what the backend actually granted.",
      },
    ],
  }),
  component: PurchasesPage,
});

const PRESETS = [
  { id: "all", label: "All" },
  { id: "at_risk", label: "Charged, not granted" },
  { id: "rejected", label: "Rejected" },
  { id: "credit", label: "Credit packs" },
  { id: "subscription", label: "Subscriptions" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];
type SortKey = "created_at" | "user_id" | "product_id";
type SortDir = "asc" | "desc";

function outcomeBadge(row: PurchaseVerificationAttemptRow) {
  if (row.verified && row.granted) {
    return <StatusBadge variant="success">Granted</StatusBadge>;
  }
  if (row.verified && !row.granted) {
    // The receipt checked out but the backend never durably recorded the
    // entitlement — the customer was charged by Google Play with nothing
    // to show for it until this is retried/reconciled.
    return <StatusBadge variant="danger">Charged, not granted</StatusBadge>;
  }
  return <StatusBadge variant="warning">Rejected</StatusBadge>;
}

function KindBadge({ kind }: { kind: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
      {kind}
    </span>
  );
}

function PurchasesPage() {
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const query = useQuery({
    queryKey: ["purchase-verification-attempts", search, preset, sortKey, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<PurchaseVerificationAttemptRow>>(
        buildApiPath("/purchase-verification-attempts", {
          search,
          preset,
          sort_by: sortKey,
          sort_dir: sortDir,
          page,
          page_size: pageSize,
        }),
      ),
  });

  const rows = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const atRiskCount = rows.filter((r) => r.verified && !r.granted).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Purchases"
        subtitle="Every Google Play verification attempt — find charges Google processed that never turned into credits or a subscription."
      />

      {query.isError ? (
        <InlineAlert variant="danger" title="Unable to load purchase attempts">
          Check backend status or adjust filters and try again.
        </InlineAlert>
      ) : null}

      {!query.isLoading && atRiskCount > 0 ? (
        <InlineAlert variant="danger" title={`${atRiskCount} purchase(s) on this page were charged but not granted`}>
          These passed receipt verification but the backend failed to record the entitlement — likely a transient
          database error. The app's own retry queue may resolve these automatically; anything still showing after a
          few hours needs a manual credit/subscription grant.
        </InlineAlert>
      ) : null}

      <Panel>
        <Toolbar
          left={
            <>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search user, product, token…"
                  className="h-8 w-full rounded-md border border-border bg-background pl-7 pr-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
              </div>
            </>
          }
          right={
            <span className="text-[12px] text-muted-foreground tabular-nums">
              {total} attempts
            </span>
          }
        />

        {query.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton className="h-52" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState
              icon={ReceiptText}
              title="No purchase attempts"
              description="No rows match the current filters."
            />
          </div>
        ) : (
          <DataTable>
            <THead>
              <TR>
                <TH className="whitespace-nowrap">When</TH>
                <TH>Kind</TH>
                <TH>User</TH>
                <TH>Product</TH>
                <TH>Platform</TH>
                <TH>Outcome</TH>
                <TH>Reason</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id} zebra>
                  <TD nowrap className="text-muted-foreground tabular-nums">
                    {formatDateTime(row.createdAt)}
                  </TD>
                  <TD>
                    <KindBadge kind={row.kind} />
                  </TD>
                  <TD className="max-w-[160px] truncate font-mono text-[12px]" title={row.userId}>
                    {row.userId || "—"}
                  </TD>
                  <TD className="font-mono text-[12px]">{row.productId || "—"}</TD>
                  <TD>{row.platform || "—"}</TD>
                  <TD>{outcomeBadge(row)}</TD>
                  <TD className="max-w-[220px] truncate text-[12px] text-muted-foreground" title={row.failureReason}>
                    {row.failureReason || "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}

        {!query.isLoading && rows.length > 0 ? (
          <RecordList>
            {rows.map((row) => (
              <RecordCard key={row.id}>
                <RecordField>
                  <span className="min-w-0 truncate font-medium text-foreground">
                    {row.productId || "—"}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-[12px] tabular-nums text-muted-foreground">
                    {formatDateTime(row.createdAt)}
                  </span>
                </RecordField>
                <RecordField>
                  <KindBadge kind={row.kind} />
                  {outcomeBadge(row)}
                </RecordField>
                <RecordField label="User">
                  <span className="font-mono text-[12px]">{row.userId || "—"}</span>
                </RecordField>
                {row.failureReason ? (
                  <div className="border-t border-border/70 pt-2 text-[12px] text-muted-foreground">
                    {row.failureReason}
                  </div>
                ) : null}
              </RecordCard>
            ))}
          </RecordList>
        ) : null}

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Panel>
    </div>
  );
}
