export function LoadingSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={
        "animate-pulse rounded-md bg-muted/60 " + className
      }
    />
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border/70">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <LoadingSkeleton className="h-3 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}
