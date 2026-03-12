"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, FolderOpen, ListTodo, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { getRelativeTime } from "@/lib/utils/relativeTime";

type ActivityFeedItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  projectId: string;
  taskId: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
  };
  project: { id: string; name: string };
  task: { id: string; title: string } | null;
};

const FILTER_PROJECTS = ["PROJECT_CREATED", "MEMBER_ADDED"];
const FILTER_TASKS = [
  "TASK_CREATED",
  "TASK_UPDATED",
  "TASK_STATUS_CHANGED",
  "TASK_ASSIGNEE_CHANGED",
  "TASK_PRIORITY_CHANGED",
  "TASK_DEADLINE_CHANGED",
  "LABEL_ADDED",
  "LABEL_REMOVED"
];
const FILTER_COMMENTS = ["COMMENT_ADDED"];

function getGroupKey(iso: string): "today" | "yesterday" | "earlier" {
  const d = new Date(iso);
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(yesterdayStart.getUTCDate() - 1);
  if (d >= todayStart) return "today";
  if (d >= yesterdayStart) return "yesterday";
  return "earlier";
}

const GROUP_LABELS: Record<string, string> = {
  today: "Сегодня",
  yesterday: "Вчера",
  earlier: "Ранее"
};

function ActivityRow({ item }: { item: ActivityFeedItem }) {
  const time = getRelativeTime(item.createdAt);
  return (
    <div className="flex gap-3 py-3">
      <UserAvatar
        user={item.user}
        size="sm"
        className="shrink-0"
        title={item.user.name ?? item.user.email}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--asana-text-primary)]">
          {item.message}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span
            className="text-xs text-[var(--asana-text-placeholder)]"
            title={new Date(item.createdAt).toLocaleString("ru-RU")}
          >
            {time}
          </span>
          <span className="text-[var(--asana-text-placeholder)]">·</span>
          <Link
            href={`/app/projects/${item.projectId}`}
            className="text-xs text-[var(--asana-blue)] hover:underline truncate max-w-[180px]"
          >
            {item.project.name}
          </Link>
          {item.task && (
            <>
              <span className="text-[var(--asana-text-placeholder)]">·</span>
              <Link
                href={`/app/projects/${item.projectId}`}
                className="text-xs text-[var(--asana-text-secondary)] hover:text-[var(--asana-text-primary)] truncate max-w-[140px]"
                title={item.task.title}
              >
                {item.task.title}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type FilterKind = "all" | "projects" | "tasks" | "comments";

function filterActivities(
  items: ActivityFeedItem[],
  filter: FilterKind
): ActivityFeedItem[] {
  if (filter === "all") return items;
  if (filter === "projects") return items.filter((a) => FILTER_PROJECTS.includes(a.type));
  if (filter === "tasks") return items.filter((a) => FILTER_TASKS.includes(a.type));
  if (filter === "comments") return items.filter((a) => FILTER_COMMENTS.includes(a.type));
  return items;
}

export default function ActivityPage() {
  const [data, setData] = useState<{
    activities: ActivityFeedItem[];
    nextCursor: string | null;
  }>({ activities: [], nextCursor: null });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKind>("all");
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = (cursor?: string) => {
    const isFirst = !cursor;
    if (isFirst) setLoading(true);
    else setLoadingMore(true);
    const url = cursor
      ? `/api/activity?limit=30&cursor=${encodeURIComponent(cursor)}`
      : "/api/activity?limit=30";
    fetch(url)
      .then((r) => (r.ok ? r.json() : { activities: [], nextCursor: null }))
      .then((res) => {
        if (isFirst) {
          setData({ activities: res.activities ?? [], nextCursor: res.nextCursor ?? null });
        } else {
          setData((prev) => ({
            activities: [...prev.activities, ...(res.activities ?? [])],
            nextCursor: res.nextCursor ?? null
          }));
        }
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    fetchPage();
  }, []);

  const filtered = filterActivities(data.activities, filter);
  const grouped = filtered.reduce(
    (acc, item) => {
      const key = getGroupKey(item.createdAt);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, ActivityFeedItem[]>
  );
  const order: ("today" | "yesterday" | "earlier")[] = ["today", "yesterday", "earlier"];

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <h1 className="page-title text-[var(--asana-text-primary)]">
            Активность
          </h1>
          <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
            Последние обновления по вашим проектам
          </p>
        </header>
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="page-title text-[var(--asana-text-primary)]">
          Активность
        </h1>
        <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
          Последние обновления по вашим проектам
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-1">
        {(
          [
            { key: "all" as const, label: "Всё", icon: Activity },
            { key: "projects" as const, label: "Проекты", icon: FolderOpen },
            { key: "tasks" as const, label: "Задачи", icon: ListTodo },
            { key: "comments" as const, label: "Комментарии", icon: MessageSquare }
          ] as const
        ).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              filter === key
                ? "border-[var(--asana-blue)] bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]"
                : "border-[var(--asana-border)] bg-transparent text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-16 text-center">
          <p className="text-[var(--asana-text-secondary)]">
            Нет активности
          </p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Действия по проектам и задачам появятся здесь
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {order.map(
            (key) =>
              grouped[key]?.length > 0 && (
                <section key={key}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                    {GROUP_LABELS[key]}
                  </h2>
                  <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] overflow-hidden">
                    <ul className="divide-y divide-[var(--asana-border-subtle)]">
                      {grouped[key].map((item) => (
                        <li key={item.id} className="px-4">
                          <ActivityRow item={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )
          )}
        </div>
      )}

      {data.nextCursor && filtered.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => fetchPage(data.nextCursor ?? undefined)}
            disabled={loadingMore}
            className="btn-secondary text-sm"
          >
            {loadingMore ? "Загрузка…" : "Загрузить ещё"}
          </button>
        </div>
      )}
    </div>
  );
}
