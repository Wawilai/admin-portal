import type { ReactNode } from "react";

/**
 * Quiet inline note for context or a live preview of what a form will do.
 * Deliberately un-bordered so it doesn't read as a second nested panel when
 * placed inside PanelBody — use for "here's what happens when you submit"
 * text, not for real aggregate stats (use StatTile for those).
 */
export function HelperNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md bg-muted/30 px-3.5 py-2.5 text-[13px] leading-6 text-muted-foreground">
      {children}
    </div>
  );
}

/** A label/value line for a HelperNote acting as a live form-state preview. */
export function PreviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground/80">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
