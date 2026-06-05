import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="page-title">{title}</div>
        <div className="page-subtitle">{subtitle}</div>
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

