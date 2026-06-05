interface StatCardProps {
  label: string;
  value: string;
  tone?: "gold" | "blue" | "green" | "amber";
}

export function StatCard({
  label,
  value,
  tone = "gold",
}: StatCardProps) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

