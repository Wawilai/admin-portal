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
import { Search, ScrollText } from "lucide-react";
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
    return <span className="text-muted-foreground/60">No details</span>;
  }

  if (row.action.startsWith("billing.")) {
    const returnedIds = formatList(metadata.returnedIds);
    const notFoundIds = formatList(metadata.notFoundIds);
    const missingCreditIds = formatList(metadata.missingCreditIds);
    const storeAvailable = metadata.storeAvailable === true ? "available" : "unavailable";
    const errorMessage = String(metadata.errorMessage ?? "");

    return (
      <div className="flex max-w-[420px] flex-col gap-1 text-[12px] leading-5">
        <DetailRow label="Returned" value={returnedIds} />
        <DetailRow label="Not found" value={notFoundIds} />
        <DetailRow label="Missing credits" value={missingCreditIds} />
        <DetailRow label="Store" value={storeAvailable} />
        {errorMessage ? <DetailRow label="Error" value={errorMessage} tone="danger" /> : null}
      </div>
    );
  }

  const entries = Object.entries(metadata);
  if (entries.length === 0) {
    return <span className="text-muted-foreground/60">No details</span>;
  }

  return (
    <div className="flex max-w-[420px] flex-col gap-1 text-[12px] leading-5">
      {entries.slice(0, 4).map(([key, value]) => (
        <DetailRow key={key} label={key} value={formatDetailValue(value)} />
      ))}
      {entries.length > 4 ? (
        <span className="text-muted-foreground/60">+{entries.length - 4} more</span>
      ) : null}
    </div>
  );
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return formatList(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function DetailRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-1.5">
      <span className="shrink-0 text-muted-foreground/70">{label}:</span>
      <span
        className={
          "min-w-0 truncate font-mono " +
          (tone === "danger" ? "text-destructive" : "text-foreground/80")
        }
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

const ROLE_VARIANT: Record<string, "danger" | "info" | "neutral"> = {
  super_admin: "danger",
  admin: "info",
};

function ActionBadge({ action }: { action: string }) {
  const [group] = action.split(".");
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-foreground">
      <span className="text-muted-foreground">{group}</span>
      <span className="text-border">/</span>
      {action.slice(group.length + 1)}
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
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search actor, action, target…"
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
            <EmptyState
              icon={ScrollText}
              title="No audit events"
              description="No rows match the current filters."
            />
          </div>
        ) : (
          <DataTable>
            <THead>
              <TR>
                <TH className="whitespace-nowrap">When</TH>
                <TH>Actor</TH>
                <TH>Role</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id} zebra>
                  <TD nowrap className="text-muted-foreground tabular-nums">
                    {formatDateTime(row.createdAt)}
                  </TD>
                  <TD className="font-medium">{row.actor}</TD>
                  <TD>
                    <StatusBadge variant={ROLE_VARIANT[row.role] ?? "neutral"} dot={false}>
                      {row.role}
                    </StatusBadge>
                  </TD>
                  <TD>
                    <ActionBadge action={row.action} />
                  </TD>
                  <TD className="max-w-[200px] truncate font-mono text-[12px] text-muted-foreground" title={row.target}>
                    {row.target}
                  </TD>
                  <TD>
                    <AuditDetails row={row} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}

        {!auditQuery.isLoading && rows.length > 0 ? (
          <RecordList>
            {rows.map((row) => (
              <RecordCard key={row.id}>
                <RecordField>
                  <span className="min-w-0 truncate font-medium text-foreground">{row.actor}</span>
                  <span className="shrink-0 whitespace-nowrap text-[12px] tabular-nums text-muted-foreground">
                    {formatDateTime(row.createdAt)}
                  </span>
                </RecordField>
                <RecordField>
                  <ActionBadge action={row.action} />
                  <StatusBadge variant={ROLE_VARIANT[row.role] ?? "neutral"} dot={false}>
                    {row.role}
                  </StatusBadge>
                </RecordField>
                <RecordField label="Target">
                  <span className="font-mono text-[12px]">{row.target}</span>
                </RecordField>
                <div className="border-t border-border/70 pt-2">
                  <AuditDetails row={row} />
                </div>
              </RecordCard>
            ))}
          </RecordList>
        ) : null}

        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Panel>
    </div>
  );
}
