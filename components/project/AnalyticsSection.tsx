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
          <p className="text-sm font-medium text-zinc-500">Всего задач</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-100">
            {total}
          </p>
        </div>
        <div className="card overflow-hidden border-red-900/50 bg-red-950/20 p-5">
          <p className="text-sm font-medium text-red-300/90">Просрочено</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-red-200">
            {overdue}
          </p>
        </div>
        <div className="card p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-zinc-500 mb-3">По статусам</p>
          <ul className="space-y-2 text-sm">
            {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map(
              (status) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-zinc-400"
                >
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="font-medium tabular-nums text-zinc-300">
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
