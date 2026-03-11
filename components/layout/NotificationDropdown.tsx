"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Task = {
  id: string;
  title: string;
  deadline: string | null;
  status: string;
  project: { id: string; name: string };
};

type Data = { overdue: Task[]; dueToday: Task[] };

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !data && !loading) {
      setLoading(true);
      fetch("/api/notifications")
        .then((r) => r.ok ? r.json() : { overdue: [], dueToday: [] })
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [open, data, loading]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  const total = data
    ? data.overdue.length + data.dueToday.length
    : 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors"
        aria-label={total > 0 ? `Уведомления: ${total}` : "Уведомления"}
        aria-expanded={open}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {total > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-md bg-[var(--asana-blue)] px-1 text-[10px] font-semibold text-white"
            aria-hidden
          >
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 w-80 overflow-hidden rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-card)] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          role="menu"
        >
          <div className="border-b border-[var(--asana-border-subtle)] px-3 py-2">
            <span className="text-sm font-semibold text-[var(--asana-text-primary)]">
              Уведомления
            </span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
              </div>
            ) : data && (data.overdue.length > 0 || data.dueToday.length > 0) ? (
              <>
                {data.overdue.length > 0 && (
                  <div className="border-b border-[var(--asana-border-subtle)]">
                    <div className="px-3 py-1.5 text-xs font-medium text-[var(--asana-red)]">
                      Просроченные
                    </div>
                    {data.overdue.map((task) => (
                      <Link
                        key={task.id}
                        href="/notifications"
                        onClick={() => setOpen(false)}
                        className="block border-b border-[var(--asana-border-subtle)] px-3 py-2 text-sm hover:bg-white/5 transition-colors last:border-b-0"
                        role="menuitem"
                      >
                        <span className="font-medium text-[var(--asana-text-primary)]">
                          {task.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--asana-text-secondary)]">
                          {task.project.name}
                          {task.deadline && ` · ${formatDeadline(task.deadline)}`}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                {data.dueToday.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-amber-400">
                      На сегодня
                    </div>
                    {data.dueToday.map((task) => (
                      <Link
                        key={task.id}
                        href="/notifications"
                        onClick={() => setOpen(false)}
                        className="block border-b border-[var(--asana-border-subtle)] px-3 py-2 text-sm hover:bg-white/5 transition-colors last:border-b-0"
                        role="menuitem"
                      >
                        <span className="font-medium text-[var(--asana-text-primary)]">
                          {task.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--asana-text-secondary)]">
                          {task.project.name}
                          {task.deadline && ` · ${formatDeadline(task.deadline)}`}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="px-3 py-6 text-center text-sm text-[var(--asana-text-secondary)]">
                Нет уведомлений
              </div>
            )}
          </div>
          <div className="border-t border-[var(--asana-border-subtle)] px-2 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-1.5 text-center text-sm font-medium text-[var(--asana-blue)] hover:bg-white/5 transition-colors"
              role="menuitem"
            >
              Все уведомления
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
