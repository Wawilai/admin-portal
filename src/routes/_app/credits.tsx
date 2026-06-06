import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PageHeader,
  Panel,
  PanelHeader,
  PanelBody,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { CreditPolicy } from "@/lib/types";

export const Route = createFileRoute("/_app/credits")({
  head: () => ({
    meta: [
      { title: "Credits — Rerkdee Admin" },
      {
        name: "description",
        content: "Inspect credit policy and make manual adjustments safely.",
      },
    ],
  }),
  component: CreditsPage,
});

function CreditsPage() {
  const queryClient = useQueryClient();
  const [freeDailyBase, setFreeDailyBase] = useState("");
  const [userId, setUserId] = useState("");
  const [delta, setDelta] = useState("100");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const policyQuery = useQuery({
    queryKey: ["credits-policy"],
    queryFn: () => apiGet<CreditPolicy>("/credits/policy"),
  });

  const policyUpdate = useMutation({
    mutationFn: (value: number) =>
      apiWrite<{ ok: boolean; freeDailyBase: number }>(
        "/credits/policy",
        { freeDailyBase: value },
      ),
    onSuccess: async () => {
      setFlash("Credit policy updated.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["credits-policy"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to update credit policy."));
      setFlash(null);
    },
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/credits/adjust", {
        userId: userId.trim(),
        delta: Number(delta),
      }),
    onSuccess: async () => {
      setFlash("Credit adjustment applied.");
      setError(null);
      setUserId("");
      setDelta("100");
      await queryClient.invalidateQueries({ queryKey: ["credits-policy"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to adjust credits."));
      setFlash(null);
    },
  });

  const policy = policyQuery.data;

  useEffect(() => {
    if (policy && freeDailyBase === "") {
      setFreeDailyBase(String(policy.freeDailyBase));
    }
  }, [policy, freeDailyBase]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Credits"
        subtitle="Inspect global credit policy and apply manual user adjustments."
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}

      {policyQuery.isLoading ? (
        <LoadingSkeleton className="h-60" />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Panel>
              <PanelHeader
                title="Credit policy"
                description="Controls the free daily base available to all users."
              />
              <PanelBody className="flex flex-col gap-4">
                <Field label="Users with credits" value={String(policy?.usersWithCredits ?? "—")} />
                <Field label="Total balance" value={String(policy?.totalBalance ?? "—")} />
                <Field label="Active today" value={String(policy?.activeToday ?? "—")} />
                <Field
                  label="Exhausted today"
                  value={String(policy?.creditsExhaustedToday ?? "—")}
                />
                <label className="block">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Free daily base
                  </span>
                  <input
                    type="number"
                    value={freeDailyBase}
                    onChange={(event) => setFreeDailyBase(event.target.value)}
                    className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => policyUpdate.mutate(Number(freeDailyBase))}
                  disabled={policyUpdate.isPending}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {policyUpdate.isPending ? "Saving…" : "Save policy"}
                </button>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader
                title="Adjust user credits"
                description="Manual balance adjustments are recorded in the audit log."
              />
              <PanelBody className="flex flex-col gap-4">
                <label className="block">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    User ID
                  </span>
                  <input
                    type="text"
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    placeholder="uid_001"
                    className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Delta
                  </span>
                  <input
                    type="number"
                    value={delta}
                    onChange={(event) => setDelta(event.target.value)}
                    className="mt-1.5 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => adjustMutation.mutate()}
                  disabled={adjustMutation.isPending}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {adjustMutation.isPending ? "Applying…" : "Apply adjustment"}
                </button>
              </PanelBody>
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              title="Users with credit balances"
              description="Current credit balances returned by the backend."
            />
            <PanelBody className="px-0 py-0">
              <DataTable>
                <THead>
                  <TR>
                    <TH>User ID</TH>
                    <TH className="text-right">Balance</TH>
                    <TH className="text-right">Used today</TH>
                    <TH className="text-right">Remaining today</TH>
                    <TH>Updated</TH>
                    <TH>Locked</TH>
                  </TR>
                </THead>
                <TBody>
                  {(policy?.items ?? []).map((row) => (
                    <TR key={row.userId}>
                      <TD className="font-mono text-[12px]">{row.userId}</TD>
                      <TD className="text-right tabular-nums">{row.balance}</TD>
                      <TD className="text-right tabular-nums text-muted-foreground">
                        {row.usedToday}
                      </TD>
                      <TD className="text-right tabular-nums">{row.remainingToday}</TD>
                      <TD className="text-muted-foreground">{formatDateTime(row.updatedAt)}</TD>
                      <TD>{row.locked ? "Yes" : "No"}</TD>
                    </TR>
                  ))}
                </TBody>
              </DataTable>
            </PanelBody>
          </Panel>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  );
}
