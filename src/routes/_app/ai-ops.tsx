import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Button,
  DataTable,
  Field,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  Select,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import type { AiConfig } from "@/lib/types";

export const Route = createFileRoute("/_app/ai-ops")({
  head: () => ({
    meta: [
      { title: "AI Ops — Rerkdee Admin" },
      {
        name: "description",
        content: "AI configuration, provider health, and observability.",
      },
    ],
  }),
  component: AIOpsPage,
});

function AIOpsPage() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configQuery = useQuery({
    queryKey: ["ai-config"],
    queryFn: () => apiGet<AiConfig>("/ai/config"),
  });

  useEffect(() => {
    if (configQuery.data) {
      setModel(configQuery.data.currentModel);
    }
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>(
        "/ai/config",
        {
          apiKey: apiKey.trim() || undefined,
          model,
        },
        "PATCH",
      ),
    onSuccess: async () => {
      setFlash("AI configuration updated.");
      setError(null);
      setApiKey("");
      await queryClient.invalidateQueries({ queryKey: ["ai-config"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to update AI configuration."));
      setFlash(null);
    },
  });

  const config = configQuery.data;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="AI Ops"
        subtitle="Manage model routing and API credentials for admin-backed AI flows."
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}

      {configQuery.isLoading ? (
        <LoadingSkeleton className="h-72" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <Panel>
            <PanelHeader
              title="AI configuration"
              description="Update the primary model and backend credential."
              actions={
                config?.hasApiKey ? (
                  <StatusBadge variant="success">configured</StatusBadge>
                ) : (
                  <StatusBadge variant="warning">missing key</StatusBadge>
                )
              }
            />
            <PanelBody className="flex flex-col gap-4">
              <Field label="Masked API key">
                <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {config?.maskedApiKey || "—"}
                </div>
              </Field>
              <Field label="Replacement API key">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder="Paste a new Gemini API key"
                />
              </Field>
              <Field label="Primary model">
                <Select value={model} onChange={(event) => setModel(event.target.value)}>
                  {(config?.availableModels ?? []).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button
                variant="primary"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Saving…" : "Save configuration"}
              </Button>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title="Recommended next metrics"
              description="Telemetry endpoints are not yet exposed by the backend, so this panel stays informational for now."
            />
            <PanelBody className="px-0 py-0">
              <DataTable>
                <THead>
                  <TR>
                    <TH>Metric</TH>
                    <TH>Why it matters</TH>
                  </TR>
                </THead>
                <TBody>
                  <TR>
                    <TD className="font-medium">Calls by feature and tier</TD>
                    <TD className="text-muted-foreground">Measure where cost and demand concentrate.</TD>
                  </TR>
                  <TR>
                    <TD className="font-medium">p50 / p95 latency</TD>
                    <TD className="text-muted-foreground">Catch degraded provider performance before support load rises.</TD>
                  </TR>
                  <TR>
                    <TD className="font-medium">Prompt rollout state</TD>
                    <TD className="text-muted-foreground">Track which prompt version is serving live traffic.</TD>
                  </TR>
                  <TR>
                    <TD className="font-medium">Provider error clusters</TD>
                    <TD className="text-muted-foreground">Separate model issues from app-side incidents.</TD>
                  </TR>
                </TBody>
              </DataTable>
            </PanelBody>
          </Panel>
        </div>
      )}
    </div>
  );
}
