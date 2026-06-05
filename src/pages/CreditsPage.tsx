import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { apiGet, apiPost, extractErrorDetail } from "../lib/api";
import { useToast } from "../features/feedback/ToastContext";
import type { CreditPolicy } from "../lib/types";

export function CreditsPage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const [userId, setUserId] = useState("");
  const [delta, setDelta] = useState("1");
  const creditQuery = useQuery({
    queryKey: ["credits-policy"],
    queryFn: () => apiGet<CreditPolicy>("/credits/policy"),
  });
  const adjustMutation = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>("/credits/adjust", {
        userId,
        delta: Number(delta),
      }),
    onSuccess: async () => {
      setUserId("");
      setDelta("1");
      showSuccess("Credits updated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["credits-policy"] });
    },
    onError: (error) => {
      showError(extractErrorDetail(error, "Unable to adjust credits right now."));
    },
  });

  const policy = creditQuery.data;
  const creditRows =
    creditQuery.data?.items?.map((row) => ({
      userId: row.userId,
      email: row.userId,
      tier: row.locked ? "locked" : "active",
      credits: row.balance,
      remainingToday: row.remainingToday,
      lastActiveAt: row.updatedAt,
      locale: "-",
    })) ?? [];

  return (
    <>
      <PageHeader
        title="Credits"
        subtitle="Control the free AI economy and debug depletion, check-in, and manual support adjustments."
      />

      {creditQuery.isLoading && !creditQuery.data ? (
        <LoadingSkeleton title="Loading credit policy" />
      ) : null}

      {creditQuery.isError ? (
        <div className="inline-alert">
          Unable to load credit policy right now. Refresh to try again.
          <div className="top-gap">
            <button
              className="ghost-button compact-button"
              onClick={() => creditQuery.refetch()}
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      ) : null}

      <div className="stats-grid">
        <div className="stat-card tone-gold">
          <div className="stat-label">Free AI / day</div>
          <div className="stat-value">{policy?.freeDailyBase ?? "-"}</div>
        </div>
        <div className="stat-card tone-blue">
          <div className="stat-label">Users With Credits</div>
          <div className="stat-value">{policy?.usersWithCredits ?? "-"}</div>
        </div>
        <div className="stat-card tone-green">
          <div className="stat-label">Total Credit Balance</div>
          <div className="stat-value">{policy?.totalBalance ?? "-"}</div>
        </div>
      </div>

      <Panel
        title="Adjust Credits"
        subtitle="Support action for adding or removing credits from a specific user."
      >
        <div className="inline-form">
          <input
            className="text-input"
            onChange={(event) => setUserId(event.target.value)}
            placeholder="User ID"
            type="text"
            value={userId}
          />
          <input
            className="text-input"
            onChange={(event) => setDelta(event.target.value)}
            placeholder="Delta"
            type="number"
            value={delta}
          />
          <button
            className="primary-button"
            disabled={adjustMutation.isPending || !userId.trim()}
            onClick={() => adjustMutation.mutate()}
            type="button"
          >
            {adjustMutation.isPending ? "Applying..." : "Apply"}
          </button>
        </div>
        {adjustMutation.isError ? (
          <div className="inline-alert">Unable to adjust credits right now.</div>
        ) : null}
      </Panel>

      <Panel title="Credit Holders">
        {creditRows.length ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Remaining Today</th>
              </tr>
            </thead>
            <tbody>
              {creditRows.map((user) => (
                <tr key={user.userId}>
                  <td>{user.email}</td>
                  <td>{user.tier}</td>
                  <td>{user.credits}</td>
                  <td>{user.remainingToday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No credit holders are available yet.</div>
        )}
      </Panel>
    </>
  );
}
