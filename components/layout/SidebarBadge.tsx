"use client";

type Props = {
  value: number;
  variant?: "default" | "amber" | "violet";
};

const variantClasses = {
  default:
    "bg-[var(--asana-bg-input)] text-[var(--asana-text-secondary)]",
  amber:
    "bg-amber-500/20 text-amber-400",
  violet:
    "bg-violet-500/20 text-violet-400"
};

export function SidebarBadge({ value, variant = "default" }: Props) {
  if (value <= 0) return null;

  const display = value > 99 ? "99+" : String(value);

  return (
    <span
      className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${variantClasses[variant]}`}
      aria-label={`${value} элементов`}
    >
      {display}
    </span>
  );
}
