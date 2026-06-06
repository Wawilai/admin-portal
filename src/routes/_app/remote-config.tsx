import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  PageHeader,
  Panel,
  PanelHeader,
  PanelBody,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import type { RemoteConfig } from "@/lib/types";

export const Route = createFileRoute("/_app/remote-config")({
  head: () => ({
    meta: [
      { title: "Remote Config — Rerkdee Admin" },
      {
        name: "description",
        content: "Update app-facing configuration safely with explicit controls.",
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
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configQuery = useQuery({
    queryKey: ["remote-config"],
    queryFn: () => apiGet<RemoteConfig>("/config"),
  });

  useEffect(() => {
    if (configQuery.data) {
      setAndroid(configQuery.data.storeUrlAndroid);
      setIos(configQuery.data.storeUrlIos);
      setWeb(configQuery.data.storeUrlWeb);
    }
  }, [configQuery.data]);

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
        subtitle="Store URLs and app distribution settings used by client update flows."
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}

      {configQuery.isLoading ? (
        <LoadingSkeleton className="h-64" />
      ) : (
        <Panel>
          <PanelHeader
            title="Store URLs"
            description="Edit the destinations used by app upgrade prompts and store links."
          />
          <PanelBody className="flex flex-col gap-4">
            <Field label="Android store URL">
              <input
                value={android}
                onChange={(event) => setAndroid(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="iOS store URL">
              <input
                value={ios}
                onChange={(event) => setIos(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Web store URL">
              <input
                value={web}
                onChange={(event) => setWeb(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saveMutation.isPending ? "Saving…" : "Save remote config"}
            </button>
          </PanelBody>
        </Panel>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
