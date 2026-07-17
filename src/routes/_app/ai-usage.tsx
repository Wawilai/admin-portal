import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Search } from "lucide-react";

import {
  DataTable,
  EmptyState,
  FilterChip,
  Input,
  InlineAlert,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  RecordCard,
  RecordField,
  RecordList,
  StatTile,
  StatusBadge,
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
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search feature, user ID, or model"
                  className="h-8 pl-7"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
              </div>
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
                    {row.success ? (
                      <StatusBadge variant="success">Success</StatusBadge>
                    ) : (
                      <StatusBadge variant="danger">Failed</StatusBadge>
                    )}
                  </TD>
                  <TD className="tabular-nums">{row.responseMs} ms</TD>
                  <TD className="text-muted-foreground">{row.model}</TD>
                </TR>
              ))}
            </TBody>
          </DataTable>
        )}

        {!usageQuery.isLoading && rows.length > 0 ? (
          <RecordList>
            {rows.map((row) => (
              <RecordCard key={row.id}>
                <RecordField>
                  <span className="inline-flex min-w-0 items-center gap-2 truncate font-medium text-foreground">
                    <Activity className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {row.feature}
                  </span>
                  {row.success ? (
                    <StatusBadge variant="success">Success</StatusBadge>
                  ) : (
                    <StatusBadge variant="danger">Failed</StatusBadge>
                  )}
                </RecordField>
                <RecordField label="When">{formatDateTime(row.createdAt)}</RecordField>
                <RecordField label="User">
                  <span className="font-mono text-[12px]">{row.userId}</span>
                </RecordField>
                <RecordField label="Latency">
                  <span className="tabular-nums">{row.responseMs} ms</span>
                </RecordField>
                <RecordField label="Model">{row.model}</RecordField>
              </RecordCard>
            ))}
          </RecordList>
        ) : null}

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
