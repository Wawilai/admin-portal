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
} from "@/components/ui-portal";
import { Search } from "lucide-react";
import { apiGet, buildApiPath } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { AuditRow, PaginatedResponse } from "@/lib/types";

export const Route = createFileRoute("/_app/audit-log")({
  head: () => ({
    meta: [
      { title: "Audit Log — Rerkdee Admin" },
      {
        name: "description",
        content: "Traceable record of operator actions across the admin portal.",
      },
    ],
  }),
  component: AuditLogPage,
});

const PRESETS = [
  { id: "all", label: "All" },
  { id: "auth", label: "Auth" },
  { id: "billing", label: "Billing" },
  { id: "credits", label: "Credits" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "promo", label: "Promo" },
  { id: "config", label: "Config" },
  { id: "admin_users", label: "Admin users" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];
type SortKey = "created_at" | "actor" | "action";
type SortDir = "asc" | "desc";

function parseMetadata(metadataJson?: string): Record<string, unknown> | null {
  if (!metadataJson?.trim()) return null;
  try {
    const parsed = JSON.parse(metadataJson) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }
  return null;
}

function formatList(value: unknown) {
  if (!Array.isArray(value)) return "";
  const items = value.map((item) => String(item)).filter(Boolean);
  return items.length > 0 ? items.join(", ") : "none";
}

function AuditDetails({ row }: { row: AuditRow }) {
  const metadata = parseMetadata(row.metadataJson);
  if (!metadata) {
    return <span className="text-muted-foreground">No details</span>;
  }

  if (row.action.startsWith("billing.")) {
    const returnedIds = formatList(metadata.returnedIds);
    const notFoundIds = formatList(metadata.notFoundIds);
    const missingCreditIds = formatList(metadata.missingCreditIds);
    const storeAvailable = metadata.storeAvailable === true ? "available" : "unavailable";
    const errorMessage = String(metadata.errorMessage ?? "");

    return (
      <div className="flex max-w-[460px] flex-col gap-0.5 font-mono text-[12px] leading-5 text-muted-foreground">
        <span>Returned: {returnedIds}</span>
        <span>Not found: {notFoundIds}</span>
        <span>Missing credits: {missingCreditIds}</span>
        <span>Store: {storeAvailable}</span>
        {errorMessage ? <span>Error: {errorMessage}</span> : null}
      </div>
    );
  }

  const raw = row.metadataJson ?? "";
  return (
    <span className="block max-w-[460px] truncate font-mono text-[12px] text-muted-foreground">
      {raw.length > 180 ? `${raw.slice(0, 180)}...` : raw}
    </span>
  );
}

function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const auditQuery = useQuery({
    queryKey: ["audit-log", search, preset, sortKey, sortDir, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<AuditRow>>(
        buildApiPath("/audit-log", {
          search,
          preset,
          sort_by: sortKey,
          sort_dir: sortDir,
          page,
          page_size: pageSize,
        }),
      ),
  });

  const rows = auditQuery.data?.items ?? [];
  const total = auditQuery.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Audit log" subtitle="Who did what, when, and to which resource." />

      {auditQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load audit log">
          Check backend status or adjust filters and try again.
        </InlineAlert>
      ) : null}

      <Panel>
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
                  placeholder="Search actor, action, target…"
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
            <span className="text-[12px] text-muted-foreground tabular-nums">
              {total} events
            </span>
          }
        />

        {auditQuery.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton className="h-52" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState title="No audit events" description="No rows match the current filters." />
          </div>
        ) : (
          <DataTable>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Actor</TH>
                <TH>Role</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="text-muted-foreground">{formatDateTime(row.createdAt)}</TD>
                  <TD className="font-medium">{row.actor}</TD>
                  <TD>{row.role}</TD>
                  <TD>{row.action}</TD>
                  <TD className="font-mono text-[12px] text-muted-foreground">{row.target}</TD>
                  <TD>
                    <AuditDetails row={row} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Panel>
    </div>
  );
}
