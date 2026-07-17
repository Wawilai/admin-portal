import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  DataTable,
  Field,
  HelperNote,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  PreviewRow,
  RecordCard,
  RecordField,
  RecordList,
  StatTile,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { CreditPolicy } from "@/lib/types";

export const Route = createFileRoute("/_app/credits")({
  head: () => ({
    meta: [
      { title: "Credits - Rerkdee Admin" },
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
      apiWrite<{ ok: boolean; freeDailyBase: number }>("/credits/policy", {
        freeDailyBase: value,
      }),
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
  const deltaValue = Number(delta);
  const adjustmentSummary = useMemo(() => {
    if (!Number.isFinite(deltaValue) || deltaValue === 0) {
      return "No change";
    }
    return deltaValue > 0
      ? `Add ${deltaValue} credits`
      : `Remove ${Math.abs(deltaValue)} credits`;
  }, [deltaValue]);

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
      {policyQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load credit policy">
          Retry when the admin API is available again.
        </InlineAlert>
      ) : null}

      {policyQuery.isLoading ? (
        <LoadingSkeleton className="h-64" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatTile label="Users with credits" value={policy?.usersWithCredits ?? "-"} />
            <StatTile label="Total balance" value={policy?.totalBalance ?? "-"} />
            <StatTile label="Active today" value={policy?.activeToday ?? "-"} />
            <StatTile
              label="Exhausted today"
              value={policy?.creditsExhaustedToday ?? "-"}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Panel>
              <PanelHeader
                title="Credit policy"
                description="Set the free daily base used by all eligible users."
              />
              <PanelBody className="flex flex-col gap-4">
                <HelperNote>
                  This value controls the baseline quota before any top-ups or bonus balances are applied.
                </HelperNote>
                <Field label="Free daily base">
                  <Input
                    type="number"
                    value={freeDailyBase}
                    onChange={(event) => setFreeDailyBase(event.target.value)}
                  />
                </Field>
                <Button
                  variant="primary"
                  onClick={() => policyUpdate.mutate(Number(freeDailyBase))}
                  disabled={policyUpdate.isPending}
                >
                  {policyUpdate.isPending ? "Saving..." : "Save policy"}
                </Button>
              </PanelBody>
            </Panel>

            <Panel>
              <PanelHeader
                title="Adjust user credits"
                description="Manual balance adjustments are recorded in the audit log."
              />
              <PanelBody className="flex flex-col gap-5">
                <HelperNote>
                  <div className="flex flex-col gap-1.5">
                    <PreviewRow label="Pending action" value={adjustmentSummary} />
                    <PreviewRow label="Target user" value={userId.trim() || "Not set"} />
                  </div>
                </HelperNote>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setDelta("10")}>+10</Button>
                  <Button size="sm" onClick={() => setDelta("50")}>+50</Button>
                  <Button size="sm" onClick={() => setDelta("100")}>+100</Button>
                  <Button size="sm" onClick={() => setDelta("-10")}>-10</Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="User ID">
                    <Input
                      type="text"
                      value={userId}
                      onChange={(event) => setUserId(event.target.value)}
                      placeholder="uid_001"
                    />
                  </Field>
                  <Field label="Delta">
                    <Input
                      type="number"
                      value={delta}
                      onChange={(event) => setDelta(event.target.value)}
                    />
                  </Field>
                </div>

                <Button
                  variant="primary"
                  onClick={() => adjustMutation.mutate()}
                  disabled={
                    adjustMutation.isPending ||
                    !userId.trim() ||
                    !Number.isFinite(deltaValue) ||
                    deltaValue === 0
                  }
                >
                  {adjustMutation.isPending ? "Applying..." : "Apply adjustment"}
                </Button>
              </PanelBody>
            </Panel>
          </div>

          <Panel>
            <PanelHeader
              title="Users with credit balances"
              description="Current balances returned by the backend."
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

              <RecordList>
                {(policy?.items ?? []).map((row) => (
                  <RecordCard key={row.userId}>
                    <RecordField>
                      <span className="min-w-0 truncate font-mono text-[12px] font-medium text-foreground">
                        {row.userId}
                      </span>
                      <span className="shrink-0 tabular-nums text-foreground">{row.balance}</span>
                    </RecordField>
                    <RecordField label="Used today">
                      <span className="tabular-nums">{row.usedToday}</span>
                    </RecordField>
                    <RecordField label="Remaining today">
                      <span className="tabular-nums">{row.remainingToday}</span>
                    </RecordField>
                    <RecordField label="Updated">{formatDateTime(row.updatedAt)}</RecordField>
                    <RecordField label="Locked">{row.locked ? "Yes" : "No"}</RecordField>
                  </RecordCard>
                ))}
              </RecordList>
            </PanelBody>
          </Panel>
        </>
      )}
    </div>
  );
}
