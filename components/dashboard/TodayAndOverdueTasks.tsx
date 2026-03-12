import Link from "next/link";

type Task = {
  id: string;
  title: string;
  deadline: string | Date | null;
  status: string;
  project: { id: string; name: string };
};

type Props = {
  overdue: Task[];
  dueToday: Task[];
};

function formatDeadline(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function TodayAndOverdueTasks({ overdue, dueToday }: Props) {
  const hasAny = overdue.length > 0 || dueToday.length > 0;
  if (!hasAny) return null;

  return (
    <section>
      <h2 className="section-title mb-4">Уведомления</h2>
      <div className="space-y-4">
        {overdue.length > 0 && (
          <div className="card overflow-hidden border-[var(--asana-red)]/40 bg-[var(--asana-red)]/10">
            <div className="px-5 py-4">
              <h3 className="text-sm font-medium text-[var(--asana-red)]">
                Просроченные ({overdue.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {overdue.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/app/projects/${task.project.id}`}
                      className="flex flex-wrap items-baseline gap-2 text-sm text-[var(--asana-text-primary)] hover:text-[var(--asana-blue)] transition-colors"
                    >
                      <span className="font-medium">{task.title}</span>
                      <span className="text-[var(--asana-text-secondary)]">
                        {task.project.name}
                        {task.deadline &&
                          ` · ${formatDeadline(task.deadline)}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {dueToday.length > 0 && (
          <div className="card overflow-hidden border-amber-500/30 bg-amber-500/5">
            <div className="px-5 py-4">
              <h3 className="text-sm font-medium text-amber-400">
                На сегодня ({dueToday.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {dueToday.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/app/projects/${task.project.id}`}
                      className="flex flex-wrap items-baseline gap-2 text-sm text-[var(--asana-text-primary)] hover:text-[var(--asana-blue)] transition-colors"
                    >
                      <span className="font-medium">{task.title}</span>
                      <span className="text-[var(--asana-text-secondary)]">
                        {task.project.name}
                        {task.deadline &&
                          ` · ${formatDeadline(task.deadline)}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
