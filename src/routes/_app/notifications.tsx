import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Clock3, DatabaseZap, ShieldAlert } from "lucide-react";
import type { ComponentType } from "react";

import {
  EmptyState,
  InlineAlert,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  StatusBadge,
} from "@/components/ui-portal";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - Rerkdee Admin" },
      {
        name: "description",
        content:
          "Notification operations will be connected after the admin API notification module is ready.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notifications"
        subtitle="Push campaigns and delivery controls will be wired into the rebuilt admin API next."
        actions={
          <StatusBadge variant="neutral" dot={false}>
            API pending
          </StatusBadge>
        }
      />

      <InlineAlert variant="info" title="Module not connected yet">
        This screen has been moved into the new portal shell, but notification
        campaign endpoints are not available in the current backend contract.
      </InlineAlert>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Panel>
          <PanelHeader
            title="What is already ready"
            description="The portal foundation is connected and secure. Notifications are the next backend module to wire."
          />
          <PanelBody className="grid gap-3 md:grid-cols-2">
            <InfoTile
              icon={ShieldAlert}
              title="Auth and permissions"
              body="Cookie session, CSRF protection, permission-aware navigation, and session recovery are already live."
            />
            <InfoTile
              icon={DatabaseZap}
              title="Core admin modules"
              body="Dashboard, users, credits, subscriptions, promo, AI config, remote config, audit log, and admin users already use the real admin API."
            />
            <InfoTile
              icon={Bell}
              title="Notifications shell"
              body="The route, navigation entry, and operator-facing layout are ready to accept real notification data once endpoints exist."
            />
            <InfoTile
              icon={Clock3}
              title="Recommended next step"
              body="Add read endpoints for campaigns, audience presets, test sends, and delivery metrics before restoring write actions."
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            title="Suggested backend scope"
            description="A lean contract is enough to unlock the first production-ready version."
          />
          <PanelBody>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><code>GET /admin-api/notifications/campaigns</code> for list and filters</p>
              <p><code>GET /admin-api/notifications/audiences</code> for saved cohorts</p>
              <p><code>POST /admin-api/notifications/test-send</code> for operator verification</p>
              <p><code>GET /admin-api/notifications/metrics</code> for delivery and open-rate summary</p>
            </div>
            <div className="mt-5">
              <Link
                to="/audit-log"
                className="inline-flex items-center rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Review current audit coverage
              </Link>
            </div>
          </PanelBody>
        </Panel>
      </div>

      <Panel>
        <PanelBody>
          <EmptyState
            title="Notification operations are intentionally paused here"
            description="The old mock campaign UI has been removed so operators do not mistake placeholder content for live delivery data."
          />
        </PanelBody>
      </Panel>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/65 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
