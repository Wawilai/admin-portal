import type { ReactNode } from "react";

type Variant =
  | "neutral"
  | "active"
  | "success"
  | "expired"
  | "trial"
  | "promo"
  | "warning"
  | "danger"
  | "info";

const STYLES: Record<Variant, string> = {
  neutral:
    "border-border bg-muted/50 text-muted-foreground",
  active:
    "border-success/30 bg-success/10 text-success",
  success:
    "border-success/30 bg-success/10 text-success",
  expired:
    "border-border bg-muted/40 text-muted-foreground",
  trial:
    "border-info/30 bg-info/10 text-info",
  promo:
    "border-primary/30 bg-primary/10 text-primary",
  warning:
    "border-warning/30 bg-warning/10 text-warning",
  danger:
    "border-destructive/30 bg-destructive/10 text-destructive",
  info:
    "border-info/30 bg-info/10 text-info",
};

export function StatusBadge({
  children,
  variant = "neutral",
  dot = true,
}: {
  children: ReactNode;
  variant?: Variant;
  dot?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium " +
        STYLES[variant]
      }
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
