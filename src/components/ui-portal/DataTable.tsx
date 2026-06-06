import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";

export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
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
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={
        "border-b border-border/70 transition-colors last:border-0 " +
        (selected
          ? "bg-primary/5"
          : "hover:bg-muted/40 ") +
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
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement> & { children?: ReactNode }) {
  return (
    <td
      {...rest}
      className={"px-4 py-2.5 text-[13px] text-foreground " + className}
    >
      {children}
    </td>
  );
}
