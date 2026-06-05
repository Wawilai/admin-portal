import { PageHeader } from "../components/ui/PageHeader";
import { subscriptions } from "../lib/demo-data";

export function SubscriptionsPage() {
  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="Operate premium access, promo-derived access, trial state, and manual entitlement corrections."
      />

      <div className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Tier</th>
              <th>Source</th>
              <th>Expires</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((row) => (
              <tr key={row.userId}>
                <td>
                  {row.email}
                  <div className="table-meta">{row.userId}</div>
                </td>
                <td>{row.tier}</td>
                <td>{row.source}</td>
                <td>{new Date(row.expiresAt).toLocaleString()}</td>
                <td>{row.active ? "yes" : "no"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

