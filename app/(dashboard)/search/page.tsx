"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, CheckSquare, Users, Search } from "lucide-react";
import { UserAvatar } from "@/components/avatar/UserAvatar";

type ProjectHit = { id: string; name: string; description: string | null };
type TaskHit = {
  id: string;
  title: string;
  status: string;
  projectId: string;
  project: { id: string; name: string };
};
type UserHit = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  avatarEmoji: string | null;
};

type SearchResult = {
  projects: ProjectHit[];
  tasks: TaskHit[];
  users: UserHit[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q")?.trim() ?? "";
  const [data, setData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q || q.length < 2) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => (r.ok ? r.json() : { projects: [], tasks: [], users: [] }))
      .then(setData)
      .finally(() => setLoading(false));
  }, [q]);

  const isEmpty = q.length < 2;
  const hasAny =
    data &&
    (data.projects.length > 0 || data.tasks.length > 0 || data.users.length > 0);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="page-title text-[var(--asana-text-primary)]">
          Поиск
        </h1>
        <p className="mt-1 text-sm text-[var(--asana-text-secondary)]">
          {isEmpty
            ? "Введите запрос в поле поиска в шапке (минимум 2 символа)"
            : `Результаты по запросу «${q}»`}
        </p>
      </header>

      {isEmpty && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-16 text-center">
          <Search className="h-10 w-10 text-[var(--asana-text-placeholder)]" aria-hidden />
          <p className="mt-4 text-[var(--asana-text-secondary)]">
            Поиск по проектам, задачам и участникам
          </p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Введите минимум 2 символа в поле поиска в шапке страницы
          </p>
        </div>
      )}

      {!isEmpty && loading && (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      )}

      {!isEmpty && !loading && data && (
        <div className="space-y-10">
          <section>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Проекты
            </h2>
            {data.projects.length === 0 ? (
              <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-10 text-center">
                <p className="text-sm text-[var(--asana-text-placeholder)]">
                  По запросу проектов не найдено
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.projects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="block rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] px-4 py-3 transition-colors hover:border-[var(--asana-border)] hover:bg-[var(--asana-bg-card-hover)]"
                    >
                      <span className="font-medium text-[var(--asana-text-primary)]">
                        {p.name}
                      </span>
                      {p.description != null && p.description !== "" && (
                        <p className="mt-1 line-clamp-2 text-sm text-[var(--asana-text-secondary)]">
                          {p.description}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Задачи
            </h2>
            {data.tasks.length === 0 ? (
              <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-10 text-center">
                <p className="text-sm text-[var(--asana-text-placeholder)]">
                  По запросу задач не найдено
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.tasks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/projects/${t.projectId}`}
                      className="block rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] px-4 py-3 transition-colors hover:border-[var(--asana-border)] hover:bg-[var(--asana-bg-card-hover)]"
                    >
                      <span className="font-medium text-[var(--asana-text-primary)]">
                        {t.title}
                      </span>
                      <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
                        {t.project.name}
                        <span className="ml-2 text-[var(--asana-text-secondary)]">
                          · {t.status.replace("_", " ")}
                        </span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="section-title mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--asana-text-placeholder)]" aria-hidden />
              Участники
            </h2>
            {data.users.length === 0 ? (
              <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-10 text-center">
                <p className="text-sm text-[var(--asana-text-placeholder)]">
                  По запросу участников не найдено
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.users.map((u) => (
                  <li key={u.id}>
                    <Link
                      href="/team"
                      className="flex items-center gap-3 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] px-4 py-3 transition-colors hover:border-[var(--asana-border)] hover:bg-[var(--asana-bg-card-hover)]"
                    >
                      <UserAvatar
                        user={{
                          id: u.id,
                          email: u.email,
                          name: u.name,
                          avatarUrl: u.avatarUrl,
                          avatarEmoji: u.avatarEmoji
                        }}
                        size="sm"
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-[var(--asana-text-primary)]">
                          {u.name ?? u.email}
                        </span>
                        {u.name != null && u.name !== "" && (
                          <p className="truncate text-sm text-[var(--asana-text-placeholder)]">
                            {u.email}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {!hasAny && (
            <div className="rounded-xl border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-card)] py-12 text-center">
              <p className="text-[var(--asana-text-secondary)]">
                Ничего не найдено по запросу «{q}»
              </p>
              <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
                Попробуйте другой запрос
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
