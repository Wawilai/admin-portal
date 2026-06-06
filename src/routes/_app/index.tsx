import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PageHeader,
  Panel,
  PanelHeader,
  PanelBody,
  StatTile,
  StatusBadge,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { apiGet } from "@/lib/api";
import type { DashboardOverview } from "@/lib/types";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Rerkdee Admin" },
      {
        name: "description",
        content: "Platform health and operational signals at a glance.",
      },
    ],
  }),
  component: DashboardPage,
});

const TREND = [
  { t: "00:00", calls: 820 },
  { t: "04:00", calls: 380 },
  { t: "08:00", calls: 1240 },
  { t: "12:00", calls: 2210 },
  { t: "16:00", calls: 2670 },
  { t: "20:00", calls: 1920 },
  { t: "22:00", calls: 1410 },
];

function healthBadge(status?: DashboardOverview["dbStatus"]) {
  if (status === "ok") return <StatusBadge variant="success">Operational</StatusBadge>;
  if (status === "warning") return <StatusBadge variant="warning">Warning</StatusBadge>;
  return <StatusBadge variant="danger">Error</StatusBadge>;
}

function DashboardPage() {
  const overviewQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => apiGet<DashboardOverview>("/dashboard/overview"),
  });

  const overview = overviewQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        subtitle="Platform health and operational signals at a glance."
      />

      {overviewQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load dashboard">
          Refresh the page or verify the admin API is online.
        </InlineAlert>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="AI calls today" value={overview?.aiCallsToday ?? "—"} />
        <StatTile label="AI calls this month" value={overview?.aiCallsMonth ?? "—"} />
        <StatTile
          label="Active subscriptions"
          value={overview?.activeSubscriptions ?? "—"}
        />
        <StatTile
          label="Credits exhausted today"
          value={overview?.creditsExhaustedToday ?? "—"}
        />
      </div>

      {overviewQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <LoadingSkeleton className="h-[340px]" />
          <LoadingSkeleton className="h-[340px]" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <PanelHeader
              title="AI call volume"
              description="Illustrative call trend while detailed telemetry wiring is still in progress."
            />
            <PanelBody className="pt-2">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="g-calls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
                    <XAxis
                      dataKey="t"
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--color-border)" }}
                    />
                    <YAxis
                      tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={36}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="var(--color-primary)"
                      strokeWidth={1.5}
                      fill="url(#g-calls)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title="System health"
              description="Current admin API dependencies and service posture."
            />
            <PanelBody className="px-0 py-0">
              <ul className="divide-y divide-border">
                <li className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-[13px] font-medium text-foreground">Database</span>
                  {healthBadge(overview?.dbStatus)}
                </li>
                <li className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-[13px] font-medium text-foreground">AI provider</span>
                  {healthBadge(overview?.aiStatus)}
                </li>
                <li className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="text-[13px] font-medium text-foreground">Push delivery</span>
                  {healthBadge(overview?.pushStatus)}
                </li>
              </ul>
            </PanelBody>
          </Panel>
        </div>
      )}
    </div>
  );
}
