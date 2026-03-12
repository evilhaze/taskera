"use client";

import { PriorityBadge } from "@/components/priority/PriorityBadge";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import type { KanbanTask } from "@/components/kanban/KanbanBoard";

const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово"
};

function formatDue(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

type Props = {
  tasks: KanbanTask[];
  onTaskClick: (taskId: string) => void;
};

export function TasksListView({ tasks, onTaskClick }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-card)]">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-[var(--asana-border)] bg-[var(--asana-bg-input)]">
            <th className="px-3 py-2 font-semibold text-[var(--asana-text-primary)]">Задача</th>
            <th className="px-3 py-2 font-semibold text-[var(--asana-text-primary)]">Исполнитель</th>
            <th className="px-3 py-2 font-semibold text-[var(--asana-text-primary)]">Дедлайн</th>
            <th className="px-3 py-2 font-semibold text-[var(--asana-text-primary)]">Приоритет</th>
            <th className="px-3 py-2 font-semibold text-[var(--asana-text-primary)]">Статус</th>
            <th className="px-3 py-2 font-semibold text-[var(--asana-text-primary)]">Комментарии</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              role="button"
              tabIndex={0}
              onClick={() => onTaskClick(task.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTaskClick(task.id);
                }
              }}
              className="border-b border-[var(--asana-border)] transition-colors hover:bg-[var(--asana-bg-card-hover)] cursor-pointer"
            >
              <td className="px-3 py-2 font-medium text-[var(--asana-text-primary)]">
                <span className="line-clamp-1">{task.title}</span>
              </td>
              <td className="px-3 py-2">
                {task.assignee ? (
                  <span className="flex items-center gap-1.5" title={task.assignee.email}>
                    <UserAvatar user={task.assignee} size="xs" />
                    <span className="max-w-[120px] truncate text-[var(--asana-text-secondary)]">{task.assignee.email}</span>
                  </span>
                ) : (
                  <span className="text-[var(--asana-text-placeholder)]">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-[var(--asana-text-secondary)]">{formatDue(task.deadline)}</td>
              <td className="px-3 py-2">
                <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
              </td>
              <td className="px-3 py-2 text-[var(--asana-text-secondary)]">{STATUS_LABELS[task.status] ?? task.status}</td>
              <td className="px-3 py-2 text-[var(--asana-text-placeholder)]">{(task.commentsCount ?? 0) > 0 ? `💬 ${task.commentsCount}` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
