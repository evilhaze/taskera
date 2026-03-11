import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "success" | "muted";
  className?: string;
};

const variantStyles = {
  default:
    "border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] text-[var(--asana-text-primary)]",
  danger:
    "border-[var(--asana-red)]/30 bg-[var(--asana-red)]/10 text-[var(--asana-red)]",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  muted:
    "border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]/80 text-[var(--asana-text-secondary)]"
};

export function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className = ""
}: Props) {
  const style = variantStyles[variant];
  return (
    <div
      className={`card overflow-hidden border p-5 transition-shadow hover:shadow-lg hover:shadow-black/10 ${style} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--asana-text-secondary)]">
            {title}
          </p>
          <p
            className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${
              variant === "default" || variant === "muted"
                ? "text-[var(--asana-text-primary)]"
                : "text-current"
            }`}
          >
            {value}
          </p>
          {subtitle != null && subtitle !== "" && (
            <p className="mt-1 text-xs text-[var(--asana-text-placeholder)]">
              {subtitle}
            </p>
          )}
        </div>
        {Icon != null && (
          <span className="shrink-0 rounded-lg bg-black/10 p-2 dark:bg-white/10">
            <Icon className="h-5 w-5 text-[var(--asana-text-secondary)]" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
