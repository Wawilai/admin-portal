import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { userDetail } from "../lib/demo-data";

export function UserDetailPage() {
  return (
    <>
      <PageHeader
        title="User 360"
        subtitle="Single-user operational view for profile, credits, subscription, device state, and support actions."
        actions={<button className="primary-button">Grant Credit</button>}
      />

      <div className="content-grid">
        <Panel title={userDetail.email} subtitle={userDetail.userId}>
          <dl className="detail-grid">
            <div><dt>Tier</dt><dd>{userDetail.tier}</dd></div>
            <div><dt>Credits</dt><dd>{userDetail.credits}</dd></div>
            <div><dt>Remaining Today</dt><dd>{userDetail.remainingToday}</dd></div>
            <div><dt>Locale</dt><dd>{userDetail.locale}</dd></div>
            <div><dt>Zodiac</dt><dd>{userDetail.zodiac}</dd></div>
            <div><dt>Element</dt><dd>{userDetail.element}</dd></div>
            <div><dt>Push</dt><dd>{userDetail.pushEnabled ? "enabled" : "disabled"}</dd></div>
            <div><dt>Promo</dt><dd>{userDetail.promoCodes.join(", ")}</dd></div>
          </dl>
        </Panel>

        <Panel title="Recent Feature Usage">
          <ul className="compact-list">
            {userDetail.recentUsage.map((row) => (
              <li key={row.feature}>
                <span>{row.feature}</span>
                <strong>{row.count}</strong>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Device Footprint" subtitle="Useful for push, fraud review, and support resolution.">
        <ul className="compact-list">
          {userDetail.devices.map((device) => (
            <li key={device.label + device.lastSeenAt}>
              <span>{device.label}</span>
              <strong>{new Date(device.lastSeenAt).toLocaleString()}</strong>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}

