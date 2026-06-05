import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";
import { useToast } from "../features/feedback/ToastContext";
import { apiGet, apiPost } from "../lib/api";
import type { RemoteConfig } from "../lib/types";

export function RemoteConfigPage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();
  const configQuery = useQuery({
    queryKey: ["remote-config"],
    queryFn: () => apiGet<RemoteConfig>("/config"),
  });
  const [storeUrlAndroid, setStoreUrlAndroid] = useState("");
  const [storeUrlIos, setStoreUrlIos] = useState("");
  const [storeUrlWeb, setStoreUrlWeb] = useState("");

  useEffect(() => {
    if (!configQuery.data) {
      return;
    }
    setStoreUrlAndroid(configQuery.data.storeUrlAndroid);
    setStoreUrlIos(configQuery.data.storeUrlIos);
    setStoreUrlWeb(configQuery.data.storeUrlWeb);
  }, [configQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPost<{ ok: boolean }>(
        "/config",
        {
          storeUrlAndroid,
          storeUrlIos,
          storeUrlWeb,
        },
        "PATCH",
      ),
    onSuccess: async () => {
      showSuccess("Remote config updated.");
      await queryClient.invalidateQueries({ queryKey: ["remote-config"] });
    },
    onError: () => {
      showError("Unable to update remote config right now.");
    },
  });

  return (
    <>
      <PageHeader
        title="Remote Config"
        subtitle="Manage app-facing store URLs and central app distribution settings."
      />

      {configQuery.isLoading && !configQuery.data ? (
        <LoadingSkeleton title="Loading remote config" />
      ) : null}

      {configQuery.isError ? (
        <div className="inline-alert">
          Unable to load remote config right now.
        </div>
      ) : null}

      <Panel title="Store URLs" subtitle="Update the destinations used by app upgrade and store prompts.">
        <div className="stack-form">
          <input
            className="text-input"
            onChange={(event) => setStoreUrlAndroid(event.target.value)}
            placeholder="Android store URL"
            type="text"
            value={storeUrlAndroid}
          />
          <input
            className="text-input"
            onChange={(event) => setStoreUrlIos(event.target.value)}
            placeholder="iOS store URL"
            type="text"
            value={storeUrlIos}
          />
          <input
            className="text-input"
            onChange={(event) => setStoreUrlWeb(event.target.value)}
            placeholder="Web store URL"
            type="text"
            value={storeUrlWeb}
          />
          <div className="inline-form">
            <button
              className="primary-button"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              type="button"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Panel>
    </>
  );
}
