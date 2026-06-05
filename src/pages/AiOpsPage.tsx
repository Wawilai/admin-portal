import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";

export function AiOpsPage() {
  return (
    <>
      <PageHeader
        title="AI Operations"
        subtitle="This module should become the control tower for feature-level usage, latency, model routing, and prompt quality."
      />

      <div className="content-grid">
        <Panel title="Recommended Widgets">
          <ul className="bullet-list">
            <li>Calls by feature and tier</li>
            <li>p50 and p95 response times</li>
            <li>Prompt version rollout state</li>
            <li>Error clusters by provider and feature</li>
            <li>Top users and anomaly spikes</li>
          </ul>
        </Panel>

        <Panel title="Immediate Backend Needs">
          <ul className="bullet-list">
            <li>`GET /admin-api/ai/usage`</li>
            <li>`GET /admin-api/ai/errors`</li>
            <li>`PATCH /admin-api/ai/config`</li>
            <li>`POST /admin-api/ai/test`</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}

