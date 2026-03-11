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
    <section className="mb-8">
      <h2 className="text-lg font-medium text-slate-200 mb-3">Аналитика</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-500">Всего задач</p>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{total}</p>
        </div>
        <div className="rounded-lg border border-red-800/60 bg-red-950/30 p-4">
          <p className="text-sm text-red-300/90">Просрочено</p>
          <p className="mt-1 text-2xl font-semibold text-red-200">{overdue}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500 mb-2">По статусам</p>
          <ul className="space-y-1.5 text-sm">
            {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map(
              (status) => (
                <li
                  key={status}
                  className="flex items-center justify-between text-slate-300"
                >
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="font-medium tabular-nums">
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
