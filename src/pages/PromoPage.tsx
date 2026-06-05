import { PageHeader } from "../components/ui/PageHeader";
import { promoCodes } from "../lib/demo-data";

export function PromoPage() {
  return (
    <>
      <PageHeader
        title="Promo Codes"
        subtitle="Create, monitor, and shut down promo campaigns with entitlement visibility and abuse control."
      />

      <div className="table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Reward</th>
              <th>Redeemed</th>
              <th>Max Uses</th>
              <th>Expires</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((code) => (
              <tr key={code.code}>
                <td>{code.code}</td>
                <td>{code.rewardLabel}</td>
                <td>{code.usedCount}</td>
                <td>{code.maxUses ?? "unlimited"}</td>
                <td>{code.expiresAt ?? "none"}</td>
                <td>{code.active ? "active" : "inactive"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

