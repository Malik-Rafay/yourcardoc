import { cn } from "@/lib/utils";

export function SeverityBadge({ severity, className }: { severity?: string; className?: string }) {
  const s = (severity || "Low").toLowerCase();
  const styles =
    s === "critical"
      ? "bg-[oklch(var(--severity-critical)/0.15)] text-[color:var(--severity-critical)] border-[color:var(--severity-critical)]/40"
      : s === "high"
      ? "bg-[oklch(var(--severity-high)/0.15)] text-[color:var(--severity-high)] border-[color:var(--severity-high)]/40"
      : s === "medium"
      ? "bg-[oklch(var(--severity-medium)/0.15)] text-[color:var(--severity-medium)] border-[color:var(--severity-medium)]/40"
      : "bg-[oklch(var(--severity-low)/0.15)] text-[color:var(--severity-low)] border-[color:var(--severity-low)]/40";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", styles, className)}>
      {severity || "Low"}
    </span>
  );
}