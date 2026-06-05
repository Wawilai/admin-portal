interface LoadingSkeletonProps {
  lines?: number;
  title?: string;
}

export function LoadingSkeleton({
  lines = 4,
  title = "Loading data",
}: LoadingSkeletonProps) {
  return (
    <div className="table-panel">
      <div className="panel-header">
        <div className="panel-title">{title}</div>
      </div>
      <div className="skeleton-block">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="skeleton-line" />
        ))}
      </div>
    </div>
  );
}
