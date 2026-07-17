import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  Button,
  DataTable,
  HelperNote,
  InlineAlert,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  RecordCard,
  RecordList,
  StatTile,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui-portal";
import { apiGet, apiWrite, extractErrorDetail } from "@/lib/api";
import type { RemoteConfig } from "@/lib/types";

const FEATURE_ROWS = [
  { key: "horoscope",     label: "ดูดวงประจำวัน",         description: "ดูดวงรายวันตามราศีและโหราศาสตร์ไทย" },
  { key: "dream",         label: "ทำนายฝัน",              description: "ตีความฝันด้วย AI และสัญลักษณ์โหราศาสตร์" },
  { key: "lagna",         label: "ลัคนาพยากรณ์",          description: "พยากรณ์ส่วนตัวตามลัคนาราศีเกิด" },
  { key: "brahma",        label: "ตำราพรหมชาติ",          description: "พยากรณ์แบบดั้งเดิมตามตำราพรหมชาติ" },
  { key: "annual",        label: "ดวงชะตาปี",             description: "ดูดวงรายปีและทิศทางชีวิต" },
  { key: "compat",        label: "ดูสมพงศ์คู่ครอง",       description: "เปรียบเทียบธาตุและนักษัตรระหว่างสองคน" },
  { key: "companion.ai",  label: "AI Companion",          description: "แชทและคำแนะนำส่วนตัวจาก AI (ใช้ credit)" },
  { key: "zodiac_weekly", label: "ดวงนักษัตรรายสัปดาห์",  description: "ดูดวงนักษัตรประจำสัปดาห์ทั้ง 12 ราศี" },
  { key: "cosmic_card",   label: "ไพ่พยากรณ์",            description: "เปิดไพ่ 1 ใบ หรือ 3 ใบเพื่อดูแนวโน้ม" },
] as const;

type AccessTier = "free" | "trial" | "premium";
type FeatureAccessMap = Record<string, AccessTier[]>;

export const Route = createFileRoute("/_app/feature-access")({
  head: () => ({
    meta: [
      { title: "Feature Access - Rerkdee Admin" },
      {
        name: "description",
        content: "Manage which subscription tiers unlock each app feature.",
      },
    ],
  }),
  component: FeatureAccessPage,
});

function FeatureAccessPage() {
  const queryClient = useQueryClient();
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

    const nextFeatures: FeatureAccessMap = {};
    FEATURE_ROWS.forEach(({ key }) => {
      nextFeatures[key] = normalizeAccess(
        configQuery.data.features?.[key]?.access ?? ["trial", "premium"],
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

  const isDirty = useMemo(
    () =>
      FEATURE_ROWS.some(({ key }) => {
        const current = JSON.stringify(normalizeAccess(features[key] ?? []));
        const loaded = JSON.stringify(normalizeAccess(loadedFeatures[key] ?? []));
        return current !== loaded;
      }),
    [features, loadedFeatures],
  );

  // Counts reflect the saved config (loadedFeatures), not in-progress edits —
  // a KPI should report what's actually live, not a value that shifts as the
  // admin toggles checkboxes before saving.
  const featureSummary = useMemo(() => {
    let freeForAll = 0;
    let premiumOnly = 0;
    let premiumAndTrial = 0;
    let custom = 0;

    FEATURE_ROWS.forEach(({ key }) => {
      const access = normalizeAccess(loadedFeatures[key] ?? []);
      const signature = access.join(",");
      if (signature === "free,trial,premium") {
        freeForAll += 1;
      } else if (signature === "premium") {
        premiumOnly += 1;
      } else if (signature === "trial,premium") {
        premiumAndTrial += 1;
      } else {
        custom += 1;
      }
    });

    return { freeForAll, premiumOnly, premiumAndTrial, custom };
  }, [loadedFeatures]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>(
        "/config",
        { features: featuresPayload },
        "PATCH",
      ),
    onSuccess: async () => {
      setFlash("Feature access updated.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["remote-config"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "Unable to update feature access."));
      setFlash(null);
    },
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Feature Access"
        subtitle="Control which subscription tiers unlock each app feature across Flutter clients."
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
        <InlineAlert variant="danger" title="Unable to load feature access">
          Retry after backend connectivity is restored.
        </InlineAlert>
      ) : null}

      {configQuery.isLoading ? (
        <LoadingSkeleton className="h-96" />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Free for all" value={featureSummary.freeForAll} />
            <StatTile label="Trial + premium" value={featureSummary.premiumAndTrial} />
            <StatTile label="Premium only" value={featureSummary.premiumOnly} />
            <StatTile label="Custom mixes" value={featureSummary.custom} />
          </div>

          <Panel>
            <PanelHeader
              title="Feature rules"
              description="Each row controls access for one app capability. Trial access always implies premium access."
            />
            <PanelBody className="flex flex-col gap-4 px-0 py-0 pt-4">
              <DataTable>
                <THead>
                  <TR>
                    <TH>Feature</TH>
                    <TH>Free</TH>
                    <TH>Trial</TH>
                    <TH>Premium</TH>
                  </TR>
                </THead>
                <TBody>
                  {FEATURE_ROWS.map((feature) => (
                    <TR key={feature.key}>
                      <TD>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-medium text-foreground">{feature.label}</div>
                          <FeatureRuleBadge access={features[feature.key] ?? []} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {feature.description}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                          {feature.key}
                        </div>
                      </TD>
                      {(["free", "trial", "premium"] as AccessTier[]).map((tier) => (
                        <TD key={tier}>
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
                        </TD>
                      ))}
                    </TR>
                  ))}
                </TBody>
              </DataTable>

              <RecordList>
                {FEATURE_ROWS.map((feature) => (
                  <RecordCard key={feature.key}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">{feature.label}</span>
                      <FeatureRuleBadge access={features[feature.key] ?? []} />
                    </div>
                    <p className="text-[12px] text-muted-foreground">{feature.description}</p>
                    <div className="flex flex-wrap gap-3 border-t border-border/70 pt-2">
                      {(["free", "trial", "premium"] as AccessTier[]).map((tier) => (
                        <label
                          key={tier}
                          className="inline-flex items-center gap-1.5 text-[13px] text-foreground"
                        >
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
                      ))}
                    </div>
                  </RecordCard>
                ))}
              </RecordList>

              <div className="px-4 pb-4 md:px-5">
                <HelperNote>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p>
                      Use this page when product or support teams need to open, restrict, or trial a feature without changing app code.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={() => {
                          setFeatures(loadedFeatures);
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
                        {saveMutation.isPending ? "Saving..." : "Save feature access"}
                      </Button>
                    </div>
                  </div>
                </HelperNote>
              </div>
            </PanelBody>
          </Panel>
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
