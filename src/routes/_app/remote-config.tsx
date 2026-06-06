import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  InlineAlert,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  StatTile,
  StatusBadge,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import type { RemoteConfig } from "@/lib/types";

const FEATURE_ROWS = [
  { key: "compat", label: "Compatibility" },
  { key: "horoscope", label: "Daily Horoscope" },
  { key: "dream", label: "Dream Interpretation" },
  { key: "lagna", label: "Lagna Prophecy" },
  { key: "brahma", label: "Brahma Chati" },
  { key: "annual", label: "Annual Fortune" },
  { key: "companion.ai", label: "AI Companion" },
  { key: "zodiac_weekly", label: "Zodiac Weekly" },
  { key: "cosmic_card", label: "Cosmic Card" },
] as const;

type AccessTier = "free" | "trial" | "premium";
type FeatureAccessMap = Record<string, AccessTier[]>;

export const Route = createFileRoute("/_app/remote-config")({
  head: () => ({
    meta: [
      { title: "Remote Config - Rerkdee Admin" },
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
  const [features, setFeatures] = useState<FeatureAccessMap>({});
  const [loadedFeatures, setLoadedFeatures] = useState<FeatureAccessMap>({});
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

    setAndroid(configQuery.data.storeUrlAndroid);
    setIos(configQuery.data.storeUrlIos);
    setWeb(configQuery.data.storeUrlWeb);

    const nextFeatures: FeatureAccessMap = {};
    FEATURE_ROWS.forEach(({ key }) => {
      nextFeatures[key] = normalizeAccess(
        configQuery.data.features?.[key]?.access ?? ["premium", "trial"],
      );
    });
    setFeatures(nextFeatures);
    setLoadedFeatures(nextFeatures);
  }, [configQuery.data]);

  const featuresPayload = useMemo(
    () =>
      Object.fromEntries(
        FEATURE_ROWS.map(({ key }) => [
          key,
          { access: normalizeAccess(features[key] ?? []) },
        ]),
      ),
    [features],
  );

  const isDirty = useMemo(() => {
    if (!configQuery.data) {
      return false;
    }

    const storeDirty =
      android !== configQuery.data.storeUrlAndroid ||
      ios !== configQuery.data.storeUrlIos ||
      web !== configQuery.data.storeUrlWeb;

    const featuresDirty = FEATURE_ROWS.some(({ key }) => {
      const current = JSON.stringify(normalizeAccess(features[key] ?? []));
      const loaded = JSON.stringify(normalizeAccess(loadedFeatures[key] ?? []));
      return current !== loaded;
    });

    return storeDirty || featuresDirty;
  }, [android, configQuery.data, features, ios, loadedFeatures, web]);

  const featureSummary = useMemo(() => {
    let freeForAll = 0;
    let premiumOnly = 0;
    let premiumAndTrial = 0;
    let custom = 0;

    FEATURE_ROWS.forEach(({ key }) => {
      const access = normalizeAccess(features[key] ?? []);
      const signature = access.join(",");
      if (signature === "free,trial,premium") {
        freeForAll += 1;
      } else if (signature === "premium") {
        premiumOnly += 1;
      } else if (signature === "trial,premium" || signature === "premium,trial") {
        premiumAndTrial += 1;
      } else {
        custom += 1;
      }
    });

    return { freeForAll, premiumOnly, premiumAndTrial, custom };
  }, [features]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>(
        "/config",
        {
          storeUrlAndroid: android,
          storeUrlIos: ios,
          storeUrlWeb: web,
          features: featuresPayload,
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
        subtitle="Store URLs and feature access settings used by client update and gating flows."
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
        <LoadingSkeleton className="h-96" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Free for all" value={featureSummary.freeForAll} />
            <StatTile label="Trial + premium" value={featureSummary.premiumAndTrial} />
            <StatTile label="Premium only" value={featureSummary.premiumOnly} />
            <StatTile label="Custom mixes" value={featureSummary.custom} />
          </div>

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
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader
              title="Feature Access"
              description="Control which subscription tiers unlock each feature. Changes take effect after the client refreshes cached config."
            />
            <PanelBody className="flex flex-col gap-4">
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Feature
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Free
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Trial
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-foreground">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {FEATURE_ROWS.map((feature) => (
                      <tr key={feature.key} className="bg-card/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-foreground">{feature.label}</div>
                            <FeatureRuleBadge access={features[feature.key] ?? []} />
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {feature.key}
                          </div>
                        </td>
                        {(["free", "trial", "premium"] as AccessTier[]).map((tier) => (
                          <td key={tier} className="px-4 py-3">
                            <label className="inline-flex items-center gap-2 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={features[feature.key]?.includes(tier) ?? false}
                                onChange={() => {
                                  setFeatures((current) => ({
                                    ...current,
                                    [feature.key]: toggleTier(current[feature.key] ?? [], tier),
                                  }));
                                }}
                              />
                              <span className="capitalize">{tier}</span>
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] leading-5 text-muted-foreground">
                Validation rule: premium stays enabled whenever trial is enabled, so trial access never exceeds premium access.
              </p>
            </PanelBody>
          </Panel>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!configQuery.data) {
                    return;
                  }
                  setAndroid(configQuery.data.storeUrlAndroid);
                  setIos(configQuery.data.storeUrlIos);
                  setWeb(configQuery.data.storeUrlWeb);
                  setFeatures(loadedFeatures);
                  setFlash(null);
                  setError(null);
                }}
                disabled={!isDirty || saveMutation.isPending}
                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-[13px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                Reset changes
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !isDirty}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {saveMutation.isPending ? "Saving..." : "Save remote config"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeatureRuleBadge({ access }: { access: AccessTier[] }) {
  const normalized = normalizeAccess(access);
  const signature = normalized.join(",");

  if (signature === "free,trial,premium") {
    return <StatusBadge variant="success">Free for all</StatusBadge>;
  }
  if (signature === "trial,premium") {
    return <StatusBadge variant="trial">Trial + premium</StatusBadge>;
  }
  if (signature === "premium") {
    return <StatusBadge variant="promo">Premium only</StatusBadge>;
  }
  return <StatusBadge variant="info">Custom</StatusBadge>;
}

function normalizeAccess(access: string[]): AccessTier[] {
  const normalized = Array.from(
    new Set(
      access.filter(
        (tier): tier is AccessTier =>
          tier === "free" || tier === "trial" || tier === "premium",
      ),
    ),
  );

  if (normalized.includes("trial") && !normalized.includes("premium")) {
    normalized.push("premium");
  }

  const order: AccessTier[] = ["free", "trial", "premium"];
  return order.filter((tier) => normalized.includes(tier));
}

function toggleTier(current: AccessTier[], tier: AccessTier): AccessTier[] {
  const next = current.includes(tier)
    ? current.filter((item) => item !== tier)
    : [...current, tier];

  if (tier === "trial" && !current.includes(tier)) {
    next.push("premium");
  }

  if (tier === "premium" && current.includes(tier) && next.includes("trial")) {
    return normalizeAccess(next.filter((item) => item !== "trial"));
  }

  return normalizeAccess(next);
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
