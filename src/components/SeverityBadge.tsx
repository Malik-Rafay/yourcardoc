import { cn } from "@/lib/utils";

export function SeverityBadge({ severity, className }: { severity?: string; className?: string }) {
  const s = (severity || "Low").toLowerCase();
  const color =
    s === "critical" ? "var(--severity-critical)"
    : s === "high" ? "var(--severity-high)"
    : s === "medium" ? "var(--severity-medium)"
    : "var(--severity-low)";
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide", className)}
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
      }}
    >
      {severity || "Low"}
    </span>
  );
}