import Link from "next/link";
import { AlertTriangle } from "lucide-react";

type OverdueTask = {
  id: string;
  title: string;
  deadline: string | null;
  projectId: string;
  projectName: string;
};

type Props = {
  count: number;
  tasks: OverdueTask[];
};

function formatDeadline(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function OverdueInsight({ count, tasks }: Props) {
  if (count === 0) {
    return (
      <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-5">
        <h3 className="text-sm font-medium text-[var(--asana-text-secondary)]">
          Просроченные задачи
        </h3>
        <p className="mt-2 text-sm text-[var(--asana-text-placeholder)]">
          Нет просроченных задач
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--asana-red)]/30 bg-[var(--asana-red)]/10 p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--asana-red)]" aria-hidden />
        <h3 className="text-sm font-medium text-[var(--asana-red)]">
          Просрочено: {count}
        </h3>
      </div>
      <p className="mt-1 text-xs text-[var(--asana-text-secondary)]">
        Требуют внимания
      </p>
      {tasks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={`/app/projects/${task.projectId}`}
                className="flex flex-col gap-0.5 rounded-md py-1.5 px-2 -mx-2 text-sm text-[var(--asana-text-primary)] transition-colors hover:bg-[var(--asana-red)]/20 hover:text-[var(--asana-text-primary)]"
              >
                <span className="font-medium truncate">{task.title}</span>
                <span className="text-xs text-[var(--asana-text-secondary)]">
                  {task.projectName}
                  {task.deadline && ` · ${formatDeadline(task.deadline)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
