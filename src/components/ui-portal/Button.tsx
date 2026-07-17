import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "destructive" | "ghost";
type Size = "sm" | "md";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  destructive:
    "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-7 px-2 text-[11px]",
  md: "h-9 px-3.5 text-[13px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      type="button"
      {...rest}
      className={
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 " +
        VARIANT_CLASS[variant] +
        " " +
        SIZE_CLASS[size] +
        " " +
        className
      }
    />
  );
}
