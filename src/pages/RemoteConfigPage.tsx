import { Panel } from "../components/ui/Panel";
import { PageHeader } from "../components/ui/PageHeader";

export function RemoteConfigPage() {
  return (
    <>
      <PageHeader
        title="Remote Config"
        subtitle="Central place for feature flags, quota policy, maintenance state, and app messaging."
      />

      <Panel title="Suggested Config Domains">
        <ul className="bullet-list">
          <li>Feature flags and kill switches</li>
          <li>AI quota and prompt version settings</li>
          <li>Minimum app version and force update state</li>
          <li>Banner content and maintenance messages</li>
        </ul>
      </Panel>
    </>
  );
}

