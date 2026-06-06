import type { ReactNode } from "react";

export function StatTile({
  label,
  value,
  delta,
  hint,
  trend,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  hint?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3.5">
      <p className="text-eyebrow">{label}</p>
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {(delta || hint) && (
        <div className="flex items-center gap-2 text-[11px]">
          {delta && <span className={`font-medium ${trendColor}`}>{delta}</span>}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
}
