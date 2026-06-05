import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { creditPolicy, users } from "../lib/demo-data";

export function CreditsPage() {
  return (
    <>
      <PageHeader
        title="Credits"
        subtitle="Control the free AI economy and debug depletion, check-in, and manual support adjustments."
      />

      <div className="stats-grid">
        <div className="stat-card tone-gold">
          <div className="stat-label">Free AI / day</div>
          <div className="stat-value">{creditPolicy.freeDailyBase}</div>
        </div>
        <div className="stat-card tone-blue">
          <div className="stat-label">Users With Credits</div>
          <div className="stat-value">{creditPolicy.usersWithCredits}</div>
        </div>
        <div className="stat-card tone-green">
          <div className="stat-label">Total Credit Balance</div>
          <div className="stat-value">{creditPolicy.totalBalance}</div>
        </div>
      </div>

      <Panel title="Credit Holders">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Tier</th>
              <th>Balance</th>
              <th>Remaining Today</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>{user.email}</td>
                <td>{user.tier}</td>
                <td>{user.credits}</td>
                <td>{user.remainingToday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

