import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";

export function NotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Future control center for campaigns, test sends, segments, and push delivery health."
      />

      <Panel title="Planned Surfaces">
        <ul className="bullet-list">
          <li>Campaign builder by audience segment</li>
          <li>Manual test send to user or device token</li>
          <li>Delivery success and failure dashboard</li>
          <li>Quiet users, expiring users, and promo audience presets</li>
        </ul>
      </Panel>
    </>
  );
}

