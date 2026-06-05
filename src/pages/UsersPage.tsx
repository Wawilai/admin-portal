import { Link } from "react-router-dom";

import { PageHeader } from "../components/ui/PageHeader";
import { users } from "../lib/demo-data";

export function UsersPage() {
  return (
    <>
      <PageHeader
        title="Users"
        subtitle="This list is the entry point to User 360, support actions, and entitlement debugging."
        actions={<button className="ghost-button">Export CSV</button>}
      />

      <div className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Tier</th>
              <th>Credits</th>
              <th>Remaining Today</th>
              <th>Locale</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>
                  <Link className="table-link" to={`/users/${user.userId}`}>
                    {user.email}
                  </Link>
                  <div className="table-meta">{user.userId}</div>
                </td>
                <td>{user.tier}</td>
                <td>{user.credits}</td>
                <td>{user.remainingToday}</td>
                <td>{user.locale}</td>
                <td>{new Date(user.lastActiveAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

