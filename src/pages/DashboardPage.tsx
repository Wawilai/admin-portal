import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { apiGet } from "../lib/api";
import type { DashboardOverview } from "../lib/types";

const usageTrend = [
  { label: "Mon", total: 5100, dream: 920, horoscope: 1810, companion: 1120 },
  { label: "Tue", total: 5480, dream: 1010, horoscope: 1960, companion: 1204 },
  { label: "Wed", total: 5905, dream: 1140, horoscope: 2085, companion: 1288 },
  { label: "Thu", total: 5722, dream: 1074, horoscope: 2011, companion: 1194 },
  { label: "Fri", total: 6170, dream: 1223, horoscope: 2214, companion: 1320 },
  { label: "Sat", total: 6033, dream: 1160, horoscope: 2170, companion: 1305 },
  { label: "Sun", total: 6450, dream: 1290, horoscope: 2340, companion: 1412 },
];

export function DashboardPage() {
  const overviewQuery = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => apiGet<DashboardOverview>("/dashboard/overview"),
  });

  const overview = overviewQuery.data;

  return (
    <>
      <PageHeader
        title="System Overview"
        subtitle="Command view for the app economy: AI usage, user access, risk, and operator action."
      />

      {overviewQuery.isLoading && !overviewQuery.data ? (
        <LoadingSkeleton lines={5} title="Loading dashboard overview" />
      ) : null}

      {overviewQuery.isError ? (
        <div className="inline-alert">
          Live dashboard data is unavailable right now. Refresh to try again.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => overviewQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <StatCard label="AI Calls Today" value={`${overview?.aiCallsToday ?? "-"}`} />
        <StatCard
          label="AI Calls This Month"
          value={`${overview?.aiCallsMonth ?? "-"}`}
          tone="blue"
        />
        <StatCard
          label="Active Subscriptions"
          value={`${overview?.activeSubscriptions ?? "-"}`}
          tone="green"
        />
        <StatCard
          label="Credits Exhausted Today"
          value={`${overview?.creditsExhaustedToday ?? "-"}`}
          tone="amber"
        />
      </div>

      <div className="content-grid">
        <Panel
          title="Feature Load Trend"
          subtitle="Seeded example of the next AI Operations chart surface."
        >
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={usageTrend}>
                <defs>
                  <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d1a64d" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#d1a64d" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#25304b" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#7e8aa8" />
                <YAxis stroke="#7e8aa8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#d1a64d"
                  fillOpacity={1}
                  fill="url(#usageFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="System Health"
          subtitle="This section should later bind to `/admin-api/dashboard/system-health`."
        >
          <div className="health-list">
            <div className="health-row">
              <span>Database</span>
              <span className={`badge ${overview?.dbStatus === "ok" ? "ok" : "warn"}`}>
                {overview?.dbStatus ?? "unknown"}
              </span>
            </div>
            <div className="health-row">
              <span>AI Provider</span>
              <span className={`badge ${overview?.aiStatus === "ok" ? "ok" : "warn"}`}>
                {overview?.aiStatus ?? "unknown"}
              </span>
            </div>
            <div className="health-row">
              <span>Push Delivery</span>
              <span className={`badge ${overview?.pushStatus === "ok" ? "ok" : "warn"}`}>
                {overview?.pushStatus ?? "unknown"}
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
