import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  Field,
  HelperNote,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import type { RemoteConfig } from "@/lib/types";

export const Route = createFileRoute("/_app/remote-config")({
  head: () => ({
    meta: [
      { title: "Remote Config - Rerkdee Admin" },
      {
        name: "description",
        content: "Update app-facing store and upgrade destinations safely.",
      },
    ],
  }),
  component: RemoteConfigPage,
});

function RemoteConfigPage() {
  const queryClient = useQueryClient();
  const [android, setAndroid] = useState("");
  const [ios, setIos] = useState("");
  const [web, setWeb] = useState("");
  const [loadedState, setLoadedState] = useState({
    android: "",
    ios: "",
    web: "",
  });
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configQuery = useQuery({
    queryKey: ["remote-config"],
    queryFn: () => apiGet<RemoteConfig>("/config"),
  });

  useEffect(() => {
    if (!configQuery.data) {
      return;
    }

    const nextState = {
      android: configQuery.data.storeUrlAndroid,
      ios: configQuery.data.storeUrlIos,
      web: configQuery.data.storeUrlWeb,
    };

    setAndroid(nextState.android);
    setIos(nextState.ios);
    setWeb(nextState.web);
    setLoadedState(nextState);
  }, [configQuery.data]);

  const isDirty = useMemo(
    () =>
      android !== loadedState.android ||
      ios !== loadedState.ios ||
      web !== loadedState.web,
    [android, ios, loadedState.android, loadedState.ios, loadedState.web, web],
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>(
        "/config",
        {
          storeUrlAndroid: android,
          storeUrlIos: ios,
          storeUrlWeb: web,
        },
        "PATCH",
      ),
    onSuccess: async () => {
      setFlash("Remote config updated.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["remote-config"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to update remote config."));
      setFlash(null);
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Remote Config"
        subtitle="Manage app store and upgrade destinations used by client update flows."
        actions={
          isDirty ? (
            <StatusBadge variant="warning">Unsaved changes</StatusBadge>
          ) : (
            <StatusBadge variant="success">Up to date</StatusBadge>
          )
        }
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}
      {configQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load remote config">
          Retry after backend connectivity is restored.
        </InlineAlert>
      ) : null}

      {configQuery.isLoading ? (
        <LoadingSkeleton className="h-72" />
      ) : (
        <Panel>
          <PanelHeader
            title="Store URLs"
            description="These links are used by app upgrade prompts and store buttons shown in Flutter clients."
          />
          <PanelBody className="flex flex-col gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Field
                label="Android store URL"
                hint="Used when Android clients are prompted to update."
              >
                <Input value={android} onChange={(event) => setAndroid(event.target.value)} />
              </Field>
              <Field
                label="iOS store URL"
                hint="Used when iPhone and iPad clients need the App Store destination."
              >
                <Input value={ios} onChange={(event) => setIos(event.target.value)} />
              </Field>
              <Field
                label="Web store URL"
                hint="Fallback destination for web and cross-platform upgrade prompts."
              >
                <Input value={web} onChange={(event) => setWeb(event.target.value)} />
              </Field>
            </div>

            <HelperNote>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p>
                  Feature gating now lives under the dedicated <span className="font-medium text-foreground">Feature Access</span> menu so operators can manage access rules separately from store configuration.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setAndroid(loadedState.android);
                      setIos(loadedState.ios);
                      setWeb(loadedState.web);
                      setFlash(null);
                      setError(null);
                    }}
                    disabled={!isDirty || saveMutation.isPending}
                  >
                    Reset changes
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending || !isDirty}
                  >
                    {saveMutation.isPending ? "Saving..." : "Save remote config"}
                  </Button>
                </div>
              </div>
            </HelperNote>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}
