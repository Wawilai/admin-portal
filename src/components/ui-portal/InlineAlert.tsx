import type { ReactNode } from "react";
import { Info, AlertTriangle, AlertOctagon, CheckCircle2 } from "lucide-react";

type Variant = "info" | "warning" | "danger" | "success";

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertOctagon,
  success: CheckCircle2,
};

const STYLES: Record<Variant, string> = {
  info: "border-info/30 bg-info/5 text-info",
  warning: "border-warning/30 bg-warning/5 text-warning",
  danger: "border-destructive/30 bg-destructive/5 text-destructive",
  success: "border-success/30 bg-success/5 text-success",
};

export function InlineAlert({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children?: ReactNode;
}) {
  const Icon = ICONS[variant];
  return (
    <div
      className={
        "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-[13px] " +
        STYLES[variant]
      }
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && (
          <div className={title ? "mt-1 text-foreground/80" : "text-foreground/80"}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
