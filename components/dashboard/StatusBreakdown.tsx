const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово"
};

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

const BAR_COLORS = {
  TODO: "bg-[var(--asana-text-placeholder)]/30",
  IN_PROGRESS: "bg-[var(--asana-blue)]/70",
  REVIEW: "bg-amber-500/70",
  DONE: "bg-emerald-500/80"
};

type Props = {
  byStatus: { TODO: number; IN_PROGRESS: number; REVIEW: number; DONE: number };
  total: number;
};

export function StatusBreakdown({ byStatus, total }: Props) {
  const max = Math.max(
    1,
    ...STATUS_ORDER.map((s) => byStatus[s])
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[var(--asana-text-secondary)]">
        По статусам
      </h3>
      <ul className="space-y-3">
        {STATUS_ORDER.map((status) => {
          const count = byStatus[status];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const barPct = max > 0 ? (count / max) * 100 : 0;
          return (
            <li
              key={status}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--asana-text-secondary)]">
                  {STATUS_LABELS[status]}
                </span>
                <span className="font-medium tabular-nums text-[var(--asana-text-primary)]">
                  {count}
                  {total > 0 && (
                    <span className="ml-1 font-normal text-[var(--asana-text-placeholder)]">
                      ({Math.round(pct)}%)
                    </span>
                  )}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-[var(--asana-bg-input)]"
                role="presentation"
              >
                <div
                  className={`h-full rounded-full transition-[width] duration-500 ease-out ${BAR_COLORS[status]}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
