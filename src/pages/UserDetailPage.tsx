import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { apiGet } from "../lib/api";
import { formatDateTime } from "../lib/formatters";
import type { UserDetail } from "../lib/types";

export function UserDetailPage() {
  const { userId = "" } = useParams();
  const detailQuery = useQuery({
    enabled: Boolean(userId),
    queryKey: ["user-detail", userId],
    queryFn: () => apiGet<UserDetail>(`/users/${userId}`),
  });

  const detail = detailQuery.data;

  return (
    <>
      <PageHeader
        title="User 360"
        subtitle="Single-user operational view for profile, credits, subscription, device state, and support actions."
        actions={<button className="primary-button">Grant Credit</button>}
      />

      {detailQuery.isLoading && !detailQuery.data ? (
        <LoadingSkeleton title="Loading user detail" />
      ) : null}

      {detailQuery.isError ? (
        <div className="inline-alert">
          Unable to load this user right now. Try reopening the record.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => detailQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {detail ? (
        <>
          <div className="content-grid">
            <Panel title={detail.email} subtitle={detail.userId}>
              <dl className="detail-grid">
                <div><dt>Tier</dt><dd>{detail.tier}</dd></div>
                <div><dt>Credits</dt><dd>{detail.credits}</dd></div>
                <div><dt>Remaining Today</dt><dd>{detail.remainingToday}</dd></div>
                <div><dt>Locale</dt><dd>{detail.locale}</dd></div>
                <div><dt>Zodiac</dt><dd>{detail.zodiac}</dd></div>
                <div><dt>Element</dt><dd>{detail.element}</dd></div>
                <div><dt>Push</dt><dd>{detail.pushEnabled ? "enabled" : "disabled"}</dd></div>
                <div><dt>Promo</dt><dd>{detail.promoCodes.join(", ") || "-"}</dd></div>
              </dl>
            </Panel>

            <Panel title="Recent Feature Usage">
              {detail.recentUsage.length ? (
                <ul className="compact-list">
                  {detail.recentUsage.map((row) => (
                    <li key={row.feature}>
                      <span>{row.feature}</span>
                      <strong>{row.count}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">No recent usage has been recorded yet.</div>
              )}
            </Panel>
          </div>

          <Panel title="Device Footprint" subtitle="Useful for push, fraud review, and support resolution.">
            {detail.devices.length ? (
              <ul className="compact-list">
                {detail.devices.map((device) => (
                  <li key={device.label + device.lastSeenAt}>
                    <span>{device.label}</span>
                    <strong>{formatDateTime(device.lastSeenAt)}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">No device records have been captured yet.</div>
            )}
          </Panel>
        </>
      ) : !detailQuery.isLoading ? (
        <div className="table-panel">
          <div className="empty-state">No user detail is available for this record.</div>
        </div>
      ) : null}
    </>
  );
}
