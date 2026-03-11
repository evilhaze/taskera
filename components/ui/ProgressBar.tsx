"use client";

const HEIGHT_CLASSES = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5"
} as const;

const LABEL_CLASSES = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm"
} as const;

type Size = keyof typeof HEIGHT_CLASSES;

type Props = {
  value: number;
  label?: string;
  size?: Size;
  className?: string;
  showPercent?: boolean;
};

export function ProgressBar({
  value,
  label,
  size = "md",
  className = "",
  showPercent = false
}: Props) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  const h = HEIGHT_CLASSES[size];
  const labelCls = LABEL_CLASSES[size];

  return (
    <div className={`w-full ${className}`}>
      {(label != null || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label != null && (
            <span className={`font-medium text-[var(--asana-text-secondary)] ${labelCls}`}>
              {label}
            </span>
          )}
          {showPercent && (
            <span
              className={`tabular-nums text-[var(--asana-text-primary)] ${labelCls}`}
              aria-hidden
            >
              {percent}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full ${h} bg-[var(--progress-track)]`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Прогресс ${percent}%`}
      >
        <div
          className={`h-full rounded-full bg-[var(--progress-fill)] transition-[width] duration-500 ease-out ${
            percent >= 100 ? "bg-[var(--progress-fill-complete)]" : ""
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
