"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Sun, CalendarClock, Clock } from "lucide-react";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { PriorityBadge } from "@/components/priority/PriorityBadge";
import { TaskModal } from "@/components/tasks/TaskModal";

const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово"
};

type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string | null;
  projectId: string;
  project: { id: string; name: string };
  assignee: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
  } | null;
};

type TodayData = {
  overdueTasks: TaskItem[];
  todayTasks: TaskItem[];
  upcomingTasks: TaskItem[];
  recentTasks: TaskItem[];
};

function formatDeadline(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function TodayTaskCard({
  task,
  onClick
}: {
  task: TaskItem;
  onClick: () => void;
}) {
  const deadlineStr = formatDeadline(task.deadline);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] px-4 py-3 text-left transition-colors hover:border-[var(--asana-border)] hover:bg-[var(--asana-bg-card-hover)]"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--asana-text-primary)] truncate">
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--asana-text-secondary)]">
          <span className="truncate" title={task.project.name}>
            {task.project.name}
          </span>
          {deadlineStr && (
            <>
              <span className="text-[var(--asana-text-placeholder)]">·</span>
              <span>{deadlineStr}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)] px-2 py-0.5 text-[10px] font-medium text-[var(--asana-text-secondary)]">
          {STATUS_LABELS[task.status] ?? task.status}
        </span>
        <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
        <UserAvatar
          user={
            task.assignee
              ? {
                  id: task.assignee.id,
                  email: task.assignee.email,
                  name: task.assignee.name,
                  avatarUrl: task.assignee.avatarUrl,
                  avatarEmoji: task.assignee.avatarEmoji
                }
              : null
          }
          size="sm"
          title={task.assignee?.email ?? "Не назначен"}
        />
      </div>
    </button>
  );
}

function TaskSection({
  title,
  icon: Icon,
  tasks,
  emptyMessage,
  variant,
  onTaskClick
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: TaskItem[];
  emptyMessage: string;
  variant: "overdue" | "today" | "upcoming" | "recent";
  onTaskClick: (taskId: string) => void;
}) {
  const variantStyles = {
    overdue:
      "border-[var(--asana-red)]/30 bg-[var(--asana-red)]/5",
    today:
      "border-amber-500/30 bg-amber-500/5",
    upcoming:
      "border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]",
    recent:
      "border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)]"
  };
  const titleStyles = {
    overdue: "text-[var(--asana-red)]",
    today: "text-amber-400",
    upcoming: "text-[var(--asana-text-secondary)]",
    recent: "text-[var(--asana-text-secondary)]"
  };

  return (
    <section className="rounded-xl border p-5 transition-colors">
      <div
        className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 ${variantStyles[variant]}`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <h2 className={`text-sm font-semibold ${titleStyles[variant]}`}>
          {title}
          {tasks.length > 0 && (
            <span className="ml-1.5 font-normal text-[var(--asana-text-placeholder)]">
              ({tasks.length})
            </span>
          )}
        </h2>
      </div>
      {tasks.length === 0 ? (
        <p className="py-4 text-center text-sm text-[var(--asana-text-placeholder)]">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <TodayTaskCard task={task} onClick={() => onTaskClick(task.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);

  const fetchData = () => {
    fetch("/api/tasks/today")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskClick = (taskId: string) => {
    setModalTaskId(taskId);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="page-title text-[var(--asana-text-primary)]">
            Сегодня
          </h1>
          <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
            Задачи, требующие внимания
          </p>
        </header>
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      </div>
    );
  }

  const d = data ?? {
    overdueTasks: [],
    todayTasks: [],
    upcomingTasks: [],
    recentTasks: []
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="page-title text-[var(--asana-text-primary)]">
          Сегодня
        </h1>
        <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
          Просроченные, на сегодня, ближайшие и недавно обновлённые задачи
        </p>
      </header>

      <div className="space-y-8">
        <TaskSection
          title="Просроченные"
          icon={AlertCircle}
          tasks={d.overdueTasks}
          emptyMessage="Нет просроченных задач"
          variant="overdue"
          onTaskClick={handleTaskClick}
        />
        <TaskSection
          title="Сегодня"
          icon={Sun}
          tasks={d.todayTasks}
          emptyMessage="Нет задач на сегодня"
          variant="today"
          onTaskClick={handleTaskClick}
        />
        <TaskSection
          title="Ближайшие"
          icon={CalendarClock}
          tasks={d.upcomingTasks}
          emptyMessage="Нет задач на ближайшие дни"
          variant="upcoming"
          onTaskClick={handleTaskClick}
        />
        <TaskSection
          title="Недавно обновлённые"
          icon={Clock}
          tasks={d.recentTasks}
          emptyMessage="Нет недавних изменений"
          variant="recent"
          onTaskClick={handleTaskClick}
        />
      </div>

      <TaskModal
        taskId={modalTaskId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalTaskId(null);
        }}
        onSaved={fetchData}
      />
    </div>
  );
}
