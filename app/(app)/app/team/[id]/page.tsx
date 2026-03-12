"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Calendar,
  Briefcase,
  FileText,
  FolderKanban,
  CheckSquare,
  Activity,
  ArrowLeft,
  User
} from "lucide-react";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getRelativeTime } from "@/lib/utils/relativeTime";

type ProfileUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  birthDate: string | null;
  position: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarEmoji: string | null;
  createdAt: string;
};

type ProfileData = {
  user: ProfileUser;
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
  };
  projects: { id: string; name: string; description: string | null; role: string }[];
  recentActivity: {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    projectId: string;
    taskId: string | null;
    project: { id: string; name: string };
    task: { id: string; title: string } | null;
  }[];
};

function getDisplayName(u: ProfileUser): string {
  const full = [u.firstName, u.lastName].filter(Boolean).join(" ");
  if (full.trim()) return full;
  if (u.nickname?.trim()) return u.nickname;
  if (u.name?.trim()) return u.name;
  return u.email;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default function TeamProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetch(`/api/team/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-24">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-16 text-center">
          <p className="text-[var(--asana-text-secondary)]">
            Пользователь не найден или у вас нет доступа к профилю
          </p>
          <button
            type="button"
            onClick={() => router.push("/app/team")}
            className="mt-4 text-sm font-medium text-[var(--asana-blue)] hover:underline"
          >
            Вернуться к команде
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, projects, recentActivity } = data;
  const displayName = getDisplayName(user);
  const progressPercent =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/app/team"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--asana-text-secondary)] hover:text-[var(--asana-text-primary)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        К команде
      </Link>

      {/* Header */}
      <header className="mb-10 flex flex-col gap-6 rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-6 sm:flex-row sm:items-start">
        <UserAvatar
          user={{
            id: user.id,
            email: user.email,
            name: displayName,
            avatarUrl: user.avatarUrl,
            avatarEmoji: user.avatarEmoji
          }}
          size="xl"
          className="shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-[var(--asana-text-primary)] sm:text-2xl">
            {displayName}
          </h1>
          {user.nickname?.trim() && displayName !== user.nickname && (
            <p className="mt-0.5 text-sm text-[var(--asana-text-placeholder)]">
              @{user.nickname}
            </p>
          )}
          {user.position?.trim() && (
            <p className="mt-1 flex items-center gap-2 text-sm text-[var(--asana-text-secondary)]">
              <Briefcase className="h-4 w-4 shrink-0" aria-hidden />
              {user.position}
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Info card */}
          <section className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-6">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Основная информация
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                  Email
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-[var(--asana-text-primary)]">
                  <Mail className="h-4 w-4 shrink-0 text-[var(--asana-text-placeholder)]" aria-hidden />
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                  Дата рождения
                </dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-[var(--asana-text-primary)]">
                  <Calendar className="h-4 w-4 shrink-0 text-[var(--asana-text-placeholder)]" aria-hidden />
                  {formatDate(user.birthDate)}
                </dd>
              </div>
              {user.bio?.trim() && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                    О себе
                  </dt>
                  <dd className="mt-1 flex gap-2 text-sm text-[var(--asana-text-primary)]">
                    <FileText className="h-4 w-4 shrink-0 text-[var(--asana-text-placeholder)] mt-0.5" aria-hidden />
                    <span className="whitespace-pre-wrap">{user.bio}</span>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-[var(--asana-text-placeholder)]">
                  В системе с
                </dt>
                <dd className="mt-1 text-sm text-[var(--asana-text-primary)]">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Projects */}
          <section className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-6">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Проекты
            </h2>
            {projects.length === 0 ? (
              <p className="py-4 text-sm text-[var(--asana-text-placeholder)]">
                Нет общих проектов
              </p>
            ) : (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/app/projects/${p.id}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)]/50 px-4 py-3 transition-colors hover:border-[var(--asana-border)] hover:bg-[var(--asana-bg-card-hover)]"
                    >
                      <span className="font-medium text-[var(--asana-text-primary)] truncate">
                        {p.name}
                      </span>
                      <span className="ml-2 shrink-0 rounded bg-[var(--asana-bg-card-hover)] px-2 py-0.5 text-xs text-[var(--asana-text-secondary)]">
                        {p.role === "OWNER" ? "Владелец" : "Участник"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent activity */}
          <section className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-6">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Недавняя активность
            </h2>
            {recentActivity.length === 0 ? (
              <p className="py-4 text-sm text-[var(--asana-text-placeholder)]">
                Пока нет активности
              </p>
            ) : (
              <ul className="divide-y divide-[var(--asana-border-subtle)]">
                {recentActivity.map((a) => (
                  <li key={a.id} className="py-3 first:pt-0">
                    <p className="text-sm text-[var(--asana-text-primary)]">
                      {a.message}
                    </p>
                    <p className="mt-1 text-xs text-[var(--asana-text-placeholder)]">
                      {getRelativeTime(a.createdAt)}
                      {" · "}
                      <Link
                        href={`/app/projects/${a.projectId}`}
                        className="text-[var(--asana-text-secondary)] hover:underline"
                      >
                        {a.project.name}
                      </Link>
                      {a.task && (
                        <>
                          {" · "}
                          <Link
                            href={`/app/projects/${a.projectId}`}
                            className="text-[var(--asana-text-secondary)] hover:underline"
                          >
                            {a.task.title}
                          </Link>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Stats sidebar */}
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] p-6">
            <h2 className="section-title mb-4 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Задачи
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--asana-text-secondary)]">Всего</span>
                <span className="font-medium tabular-nums text-[var(--asana-text-primary)]">
                  {stats.totalTasks}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--asana-text-secondary)]">Выполнено</span>
                <span className="font-medium tabular-nums text-emerald-400">
                  {stats.completedTasks}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--asana-text-secondary)]">В работе</span>
                <span className="font-medium tabular-nums text-[var(--asana-blue)]">
                  {stats.inProgressTasks}
                </span>
              </div>
              {stats.overdueTasks > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--asana-text-secondary)]">Просрочено</span>
                  <span className="font-medium tabular-nums text-[var(--asana-red)]">
                    {stats.overdueTasks}
                  </span>
                </div>
              )}
            </div>
            {stats.totalTasks > 0 && (
              <div className="mt-4">
                <ProgressBar
                  value={progressPercent}
                  size="sm"
                  showPercent
                  className="[--progress-track:var(--asana-bg-input)]"
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
