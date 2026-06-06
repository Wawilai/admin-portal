import type { ComponentType, ReactNode, SVGProps } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
