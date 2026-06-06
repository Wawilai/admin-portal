import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Search } from "lucide-react";

import {
  DataTable,
  EmptyState,
  FilterChip,
  InlineAlert,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  StatTile,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from "@/components/ui-portal";
import { apiGet, buildApiPath } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { AiUsageResponse } from "@/lib/types";

export const Route = createFileRoute("/_app/ai-usage")({
  head: () => ({
    meta: [
      { title: "AI Usage - Rerkdee Admin" },
      {
        name: "description",
        content: "Feature-level AI call history, reliability, and latency monitoring.",
      },
    ],
  }),
  component: AiUsagePage,
});

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "success", label: "Success" },
  { id: "failed", label: "Failed" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["id"];

function AiUsagePage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const usageQuery = useQuery({
    queryKey: ["ai-usage", search, status, page, pageSize],
    queryFn: () =>
      apiGet<AiUsageResponse>(
        buildApiPath("/ai/usage", {
          search,
          status,
          page,
          page_size: pageSize,
        }),
      ),
  });

  const rows = usageQuery.data?.items ?? [];
  const total = usageQuery.data?.total ?? 0;
  const summary = usageQuery.data?.summary;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="AI Usage"
        subtitle="Monitor feature-level call volume, reliability, and response time from the backend usage log."
      />

      {usageQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load AI usage">
          The usage endpoint could not be loaded. Check backend status and try again.
        </InlineAlert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total calls"
          value={summary ? summary.totalCalls.toLocaleString() : "—"}
          hint="Filtered result set"
        />
        <StatTile
          label="Success rate"
          value={summary ? `${summary.successRate}%` : "—"}
          hint="Successful calls"
          trend={summary && summary.successRate < 90 ? "down" : "neutral"}
        />
        <StatTile
          label="Avg latency"
          value={summary ? `${summary.avgLatencyMs} ms` : "—"}
          hint="Average response time"
        />
        <StatTile
          label="Top model"
          value={summary?.topModel || "—"}
          hint="Most-used model"
        />
      </div>

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
                  placeholder="Search feature, user ID, or model"
                  className="h-8 w-72 rounded-md border border-border bg-background pl-7 pr-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
                />
              </div>
              {STATUS_FILTERS.map((item) => (
                <FilterChip
                  key={item.id}
                  active={status === item.id}
                  onClick={() => {
                    setStatus(item.id);
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
              {total} rows
            </span>
          }
        />

        {usageQuery.isLoading ? (
          <div className="p-5">
            <LoadingSkeleton className="h-52" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState
              title="No AI usage found"
              description="No usage rows match the current search or filter."
            />
          </div>
        ) : (
          <DataTable>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Feature</TH>
                <TH>User</TH>
                <TH>Status</TH>
                <TH>Latency</TH>
                <TH>Model</TH>
              </TR>
            </THead>
            <TBody>
              {rows.map((row) => (
                <TR key={row.id}>
                  <TD className="text-muted-foreground">{formatDateTime(row.createdAt)}</TD>
                  <TD className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-primary" />
                      {row.feature}
                    </span>
                  </TD>
                  <TD className="font-mono text-[12px] text-muted-foreground">{row.userId}</TD>
                  <TD>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        row.success
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {row.success ? "Success" : "Failed"}
                    </span>
                  </TD>
                  <TD className="tabular-nums">{row.responseMs} ms</TD>
                  <TD className="text-muted-foreground">{row.model}</TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </Panel>
    </div>
  );
}
