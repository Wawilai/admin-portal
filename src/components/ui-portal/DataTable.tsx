import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

/**
 * Table surface for md+ viewports. Hidden below md — pair with RecordList to
 * render the same rows as stacked cards on phones instead of forcing a
 * horizontal scroll.
 */
export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

/** Phone-width fallback for DataTable — stacked cards, one per record. */
export function RecordList({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 p-3 md:hidden">{children}</div>;
}

export function RecordCard({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={
        "flex flex-col gap-2 rounded-lg border border-border bg-background/40 px-3.5 py-3 text-[13px] " +
        (onClick ? "cursor-pointer active:bg-muted/40" : "")
      }
    >
      {children}
    </div>
  );
}

/** A label/value line inside a RecordCard. Omit label for the card's headline row. */
export function RecordField({
  label,
  children,
  className = "",
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  if (!label) {
    return <div className={"flex items-center justify-between gap-2 " + className}>{children}</div>;
  }
  return (
    <div className={"flex items-baseline justify-between gap-3 " + className}>
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
        {label}
      </span>
      <span className="min-w-0 truncate text-right text-foreground">{children}</span>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-border bg-background/40 text-left">
      {children}
    </thead>
  );
}

export function TH({
  children,
  className = "",
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <th
      {...rest}
      className={
        "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground " +
        className
      }
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({
  children,
  selected = false,
  zebra = false,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  zebra?: boolean;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={
        "border-b border-border/70 transition-colors last:border-0 " +
        (selected
          ? "bg-primary/5"
          : zebra
          ? "odd:bg-transparent even:bg-muted/20 hover:bg-muted/40"
          : "hover:bg-muted/40") +
        (onClick ? " cursor-pointer" : "")
      }
    >
      {children}
    </tr>
  );
}

export function TD({
  children,
  className = "",
  nowrap = false,
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode; nowrap?: boolean }) {
  return (
    <td
      {...rest}
      className={
        "px-4 py-2.5 align-middle text-[13px] text-foreground " +
        (nowrap ? "whitespace-nowrap " : "") +
        className
      }
    >
      {children}
    </td>
  );
}
