"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TaskModal } from "@/components/tasks/TaskModal";
import { UserAvatar } from "@/components/avatar/UserAvatar";

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

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

function getMonthKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [data, setData] = useState<{ tasks: TaskItem[]; byDate: Record<string, TaskItem[]> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);

  const monthKey = getMonthKey(current);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tasks/calendar?month=${monthKey}`)
      .then((r) => (r.ok ? r.json() : { tasks: [], byDate: {} }))
      .then(setData)
      .finally(() => setLoading(false));
  }, [monthKey]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7; // Пн = 0
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startPadding + daysInMonth) / 7) * 7;

  const byDate = data?.byDate ?? {};
  const todayKey = getDateKey(new Date());

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-[var(--asana-text-primary)]">
            Календарь
          </h1>
          <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
            Задачи с дедлайнами по дням
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrent(new Date(year, month - 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-input)] text-[var(--asana-text-secondary)] transition-colors hover:bg-[var(--asana-bg-card-hover)]"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[160px] text-center text-lg font-semibold text-[var(--asana-text-primary)]">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => setCurrent(new Date(year, month + 1, 1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-input)] text-[var(--asana-text-secondary)] transition-colors hover:bg-[var(--asana-bg-card-hover)]"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--asana-border)] bg-[var(--asana-bg-card)] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--asana-border)] bg-[var(--asana-bg-input)]">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="border-r border-[var(--asana-border)] py-2 text-center text-xs font-semibold text-[var(--asana-text-secondary)] last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-7 auto-rows-fr"
            style={{ minHeight: "400px" }}
          >
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - startPadding + 1;
              const isInMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const date = new Date(year, month, dayNum);
              const key = isInMonth ? getDateKey(date) : "";
              const tasks = key ? byDate[key] ?? [] : [];
              const isToday = key === todayKey;

              return (
                <div
                  key={i}
                  className={`min-h-[80px] border-b border-r border-[var(--asana-border)] p-2 last:border-r-0 ${
                    isInMonth ? "bg-[var(--asana-bg-card)]" : "bg-[var(--asana-bg-input)]/50"
                  }`}
                >
                  <div
                    className={`text-right text-sm font-medium ${
                      isInMonth ? "text-[var(--asana-text-primary)]" : "text-[var(--asana-text-placeholder)]"
                    } ${isToday ? "rounded bg-[var(--asana-blue)]/20 px-1 py-0.5" : ""}`}
                  >
                    {isInMonth ? dayNum : ""}
                  </div>
                  <ul className="mt-1 space-y-1">
                    {tasks.slice(0, 3).map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          onClick={() => setModalTaskId(task.id)}
                          className="w-full rounded border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)] px-2 py-1.5 text-left text-xs transition-colors hover:border-[var(--asana-blue)]/50 hover:bg-[var(--asana-bg-card-hover)]"
                        >
                          <p className="truncate font-medium text-[var(--asana-text-primary)]">
                            {task.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1">
                            <UserAvatar
                              user={task.assignee ? { id: task.assignee.id, email: task.assignee.email, name: task.assignee.name, avatarUrl: task.assignee.avatarUrl, avatarEmoji: task.assignee.avatarEmoji } : null}
                              size="xs"
                            />
                            <span className="truncate text-[10px] text-[var(--asana-text-placeholder)]">
                              {task.project.name}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                    {tasks.length > 3 && (
                      <li className="px-2 py-0.5 text-[10px] text-[var(--asana-text-placeholder)]">
                        +{tasks.length - 3}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TaskModal
        taskId={modalTaskId}
        open={!!modalTaskId}
        onClose={() => setModalTaskId(null)}
        onSaved={() => {
          fetch(`/api/tasks/calendar?month=${monthKey}`)
            .then((r) => (r.ok ? r.json() : { tasks: [], byDate: {} }))
            .then(setData);
        }}
      />
    </div>
  );
}
