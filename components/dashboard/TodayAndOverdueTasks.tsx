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
          <div className="card overflow-hidden border-red-900/50 bg-red-950/20">
            <div className="px-5 py-4">
              <h3 className="text-sm font-medium text-red-200/90">
                Просроченные ({overdue.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {overdue.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/projects/${task.project.id}`}
                      className="flex flex-wrap items-baseline gap-2 text-sm text-zinc-300 hover:text-violet-300 transition-colors"
                    >
                      <span className="font-medium">{task.title}</span>
                      <span className="text-zinc-500">
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
          <div className="card overflow-hidden border-amber-900/40 bg-amber-950/10">
            <div className="px-5 py-4">
              <h3 className="text-sm font-medium text-amber-200/90">
                На сегодня ({dueToday.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {dueToday.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/projects/${task.project.id}`}
                      className="flex flex-wrap items-baseline gap-2 text-sm text-zinc-300 hover:text-violet-300 transition-colors"
                    >
                      <span className="font-medium">{task.title}</span>
                      <span className="text-zinc-500">
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
