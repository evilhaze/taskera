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
    <section className="mb-8">
      <h2 className="text-lg font-medium text-slate-200 mb-3">Уведомления</h2>
      <div className="space-y-4">
        {overdue.length > 0 && (
          <div className="rounded-lg border border-red-800/60 bg-red-950/30 p-4">
            <h3 className="text-sm font-medium text-red-200 mb-2">
              Просроченные задачи ({overdue.length})
            </h3>
            <ul className="space-y-2">
              {overdue.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="flex flex-wrap items-baseline gap-2 text-sm text-slate-200 hover:text-sky-300"
                  >
                    <span className="font-medium">{task.title}</span>
                    <span className="text-slate-500">
                      {task.project.name}
                      {task.deadline && ` · ${formatDeadline(task.deadline)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {dueToday.length > 0 && (
          <div className="rounded-lg border border-amber-800/50 bg-amber-950/20 p-4">
            <h3 className="text-sm font-medium text-amber-200 mb-2">
              На сегодня ({dueToday.length})
            </h3>
            <ul className="space-y-2">
              {dueToday.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="flex flex-wrap items-baseline gap-2 text-sm text-slate-200 hover:text-sky-300"
                  >
                    <span className="font-medium">{task.title}</span>
                    <span className="text-slate-500">
                      {task.project.name}
                      {task.deadline && ` · ${formatDeadline(task.deadline)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
