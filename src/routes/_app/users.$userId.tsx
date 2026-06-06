import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  PageHeader,
  Panel,
  PanelHeader,
  PanelBody,
  StatusBadge,
  DataTable,
  THead,
  TH,
  TBody,
  TR,
  TD,
  EmptyState,
  InlineAlert,
  LoadingSkeleton,
} from "@/components/ui-portal";
import { ArrowLeft } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDateOnly, timeAgo } from "@/lib/formatters";
import type { UserDetail } from "@/lib/types";

export const Route = createFileRoute("/_app/users/$userId")({
  head: () => ({
    meta: [
      { title: "User 360 — Rerkdee Admin" },
      {
        name: "description",
        content: "Complete operational view of a single user.",
      },
    ],
  }),
  component: UserDetailPage,
});

function tierBadge(tier: string) {
  const normalized = tier.toLowerCase();
  if (normalized.includes("premium") || normalized.includes("pro")) {
    return <StatusBadge variant="promo">Premium</StatusBadge>;
  }
  if (normalized.includes("trial")) {
    return <StatusBadge variant="trial">Trial</StatusBadge>;
  }
  return <StatusBadge variant="neutral">Free</StatusBadge>;
}

function UserDetailPage() {
  const { userId } = Route.useParams();
  const detailQuery = useQuery({
    queryKey: ["user-detail", userId],
    queryFn: () => apiGet<UserDetail>(`/users/${userId}`),
  });

  const user = detailQuery.data;

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/users"
        className="inline-flex w-fit items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to users
      </Link>

      <PageHeader
        title="User 360"
        subtitle="Identity, entitlements, usage, devices, and promo history in one support view."
      />

      {detailQuery.isError ? (
        <InlineAlert variant="danger" title="Unable to load this user">
          The record may no longer exist or the admin API is unavailable.
        </InlineAlert>
      ) : null}

      {detailQuery.isLoading ? (
        <LoadingSkeleton className="h-80" />
      ) : !user ? (
        <EmptyState title="No user detail found" description="This user could not be loaded." />
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col gap-5">
              <Panel>
                <PanelHeader title={user.email} description={user.userId} actions={tierBadge(user.tier)} />
                <PanelBody className="grid gap-4 md:grid-cols-2">
                  <Field label="Locale" value={user.locale} />
                  <Field label="Credits" value={String(user.credits)} />
                  <Field label="Remaining today" value={String(user.remainingToday)} />
                  <Field label="Push" value={user.pushEnabled ? "Enabled" : "Disabled"} />
                  <Field label="Zodiac" value={user.zodiac} />
                  <Field label="Element" value={user.element} />
                  <Field
                    label="Subscription expires"
                    value={formatDateOnly(user.subscriptionExpiresAt)}
                  />
                  <Field label="Last active" value={timeAgo(user.lastActiveAt)} />
                </PanelBody>
              </Panel>

              <Panel>
                <PanelHeader
                  title="Recent feature usage"
                  description="Most recent usage totals returned by the admin API."
                />
                <PanelBody className="px-0 py-0">
                  {user.recentUsage.length === 0 ? (
                    <div className="px-5 py-8">
                      <EmptyState
                        title="No recent usage"
                        description="No feature usage has been recorded for this user yet."
                      />
                    </div>
                  ) : (
                    <DataTable>
                      <THead>
                        <TR>
                          <TH>Feature</TH>
                          <TH className="text-right">Count</TH>
                        </TR>
                      </THead>
                      <TBody>
                        {user.recentUsage.map((entry) => (
                          <TR key={entry.feature}>
                            <TD className="font-medium">{entry.feature}</TD>
                            <TD className="text-right tabular-nums">{entry.count}</TD>
                          </TR>
                        ))}
                      </TBody>
                    </DataTable>
                  )}
                </PanelBody>
              </Panel>
            </div>

            <div className="flex flex-col gap-5">
              <Panel>
                <PanelHeader title="Devices" description="Known device footprint for this user." />
                <PanelBody className="px-0 py-0">
                  {user.devices.length === 0 ? (
                    <div className="px-5 py-8">
                      <EmptyState
                        title="No devices"
                        description="No device records have been captured for this user."
                      />
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {user.devices.map((device) => (
                        <li key={`${device.label}-${device.lastSeenAt}`} className="px-5 py-3">
                          <div className="text-[13px] font-medium text-foreground">{device.label}</div>
                          <div className="mt-0.5 text-[12px] text-muted-foreground">
                            Last seen {timeAgo(device.lastSeenAt)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </PanelBody>
              </Panel>

              <Panel>
                <PanelHeader title="Promo history" description="Promo codes recorded on this account." />
                <PanelBody className="px-0 py-0">
                  {user.promoCodes.length === 0 ? (
                    <div className="px-5 py-8">
                      <EmptyState
                        title="No promo codes"
                        description="This user has not redeemed any promo codes."
                      />
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {user.promoCodes.map((code) => (
                        <li key={code} className="px-5 py-3 font-mono text-[12px] text-foreground">
                          {code}
                        </li>
                      ))}
                    </ul>
                  )}
                </PanelBody>
              </Panel>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}
