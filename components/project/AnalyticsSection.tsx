type Props = {
  total: number;
  byStatus: { TODO: number; IN_PROGRESS: number; REVIEW: number; DONE: number };
  overdue: number;
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово"
};

export function AnalyticsSection({ total, byStatus, overdue }: Props) {
  return (
    <section>
      <h2 className="section-title mb-4">Аналитика</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-[var(--asana-text-secondary)]">Всего задач</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--asana-text-primary)]">
            {total}
          </p>
        </div>
        <div className="card overflow-hidden border-[var(--asana-red)]/40 bg-[var(--asana-red)]/10 p-5">
          <p className="text-sm font-medium text-[var(--asana-red)]">Просрочено</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--asana-red)]">
            {overdue}
          </p>
        </div>
        <div className="card p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[var(--asana-text-secondary)] mb-3">По статусам</p>
          <ul className="space-y-2 text-sm">
            {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map(
              (status) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-[var(--asana-text-secondary)]"
                >
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="font-medium tabular-nums text-[var(--asana-text-primary)]">
                    {byStatus[status]}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
