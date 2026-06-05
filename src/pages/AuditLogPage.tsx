import { PageHeader } from "../components/ui/PageHeader";
import { auditRows } from "../lib/demo-data";

export function AuditLogPage() {
  return (
    <>
      <PageHeader
        title="Audit Log"
        subtitle="Every operator action that changes production state should land here with actor, target, and timestamp."
      />

      <div className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Target</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {auditRows.map((row) => (
              <tr key={row.id}>
                <td>{row.actor}</td>
                <td>{row.role}</td>
                <td>{row.action}</td>
                <td>{row.target}</td>
                <td>{new Date(row.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

