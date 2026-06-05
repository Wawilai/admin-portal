import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../features/feedback/ToastContext";
import { apiGet, apiPost } from "../lib/api";
import type { AiConfig } from "../lib/types";

export function AiOpsPage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const configQuery = useQuery({
    queryKey: ["ai-config"],
    queryFn: () => apiGet<AiConfig>("/ai/config"),
  });
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.5-flash");

  useEffect(() => {
    if (!configQuery.data) {
      return;
    }
    setModel(configQuery.data.currentModel);
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>(
        "/ai/config",
        {
          apiKey: apiKey.trim() || undefined,
          model,
        },
        "PATCH",
      ),
    onSuccess: async () => {
      setApiKey("");
      showSuccess("AI configuration updated.");
      await queryClient.invalidateQueries({ queryKey: ["ai-config"] });
    },
    onError: () => {
      showError("Unable to update AI configuration right now.");
    },
  });

  const config = configQuery.data;

  return (
    <>
      <PageHeader
        title="AI Operations"
        subtitle="Manage model routing and API credentials for the admin-backed AI experience."
      />

      {configQuery.isLoading && !config ? (
        <LoadingSkeleton title="Loading AI configuration" />
      ) : null}

      {configQuery.isError ? (
        <div className="inline-alert">
          Unable to load AI configuration right now.
        </div>
      ) : null}

      <div className="content-grid">
        <Panel title="AI Configuration" subtitle="Update the API key and primary generation model.">
          <div className="detail-grid">
            <div>
              <dt>API Key Status</dt>
              <dd>{config?.hasApiKey ? "Configured" : "Missing"}</dd>
            </div>
            <div>
              <dt>Masked API Key</dt>
              <dd>{config?.maskedApiKey || "-"}</dd>
            </div>
          </div>

          <div className="inline-form top-gap">
            <input
              className="text-input"
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="New Gemini API key"
              type="password"
              value={apiKey}
            />
            <select
              className="text-input select-input"
              onChange={(event) => setModel(event.target.value)}
              value={model}
            >
              {(config?.availableModels ?? ["gemini-2.5-flash"]).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              className="primary-button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              type="button"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </Panel>

        <Panel title="Recommended Next Metrics">
          <ul className="bullet-list">
            <li>Calls by feature and tier</li>
            <li>p50 and p95 response times</li>
            <li>Prompt version rollout state</li>
            <li>Error clusters by provider and feature</li>
            <li>Top users and anomaly spikes</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
