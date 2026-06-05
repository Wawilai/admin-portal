import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { dashboardOverview, usageTrend } from "../lib/demo-data";

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="System Overview"
        subtitle="Command view for the app economy: AI usage, user access, risk, and operator action."
      />

      <div className="stats-grid">
        <StatCard label="AI Calls Today" value={`${dashboardOverview.aiCallsToday}`} />
        <StatCard
          label="AI Calls This Month"
          value={`${dashboardOverview.aiCallsMonth}`}
          tone="blue"
        />
        <StatCard
          label="Active Subscriptions"
          value={`${dashboardOverview.activeSubscriptions}`}
          tone="green"
        />
        <StatCard
          label="Credits Exhausted Today"
          value={`${dashboardOverview.creditsExhaustedToday}`}
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
              <span className="badge ok">{dashboardOverview.dbStatus}</span>
            </div>
            <div className="health-row">
              <span>AI Provider</span>
              <span className="badge warn">{dashboardOverview.aiStatus}</span>
            </div>
            <div className="health-row">
              <span>Push Delivery</span>
              <span className="badge ok">{dashboardOverview.pushStatus}</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

