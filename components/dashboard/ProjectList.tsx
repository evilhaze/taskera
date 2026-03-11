"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";

type Project = {
  id: string;
  name: string;
  description: string | null;
  myRole: string;
  _count: { members: number; tasks: number };
  owner: { id: string; email: string; name: string | null };
  totalTasks: number;
  doneTasks: number;
  overdueTasks: number;
  progressPercent: number;
};

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="section-title mb-4">Мои проекты</h2>
        <div className="card flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-sm text-[var(--asana-text-secondary)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
            Загрузка…
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section>
        <h2 className="section-title mb-4">Мои проекты</h2>
        <div className="card flex flex-col items-center justify-center py-14 text-center">
          <p className="text-[var(--asana-text-secondary)]">Проектов пока нет.</p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Создайте первый проект с помощью формы выше.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="section-title mb-4">Мои проекты</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="card card-hover block p-5"
            >
              <span className="font-medium text-[var(--asana-text-primary)]">{p.name}</span>
              {p.description && (
                <p className="mt-1.5 line-clamp-2 text-sm text-[var(--asana-text-secondary)]">
                  {p.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--asana-text-secondary)]">
                <span>{p._count.members} участников</span>
                <span>·</span>
                <span>{p.totalTasks} задач</span>
                {p.myRole === "OWNER" && (
                  <span className="ml-1 rounded bg-[var(--asana-bg-card-hover)] px-2 py-0.5 font-medium text-[var(--asana-text-primary)]">
                    Владелец
                  </span>
                )}
              </div>
              <div className="mt-4">
                <ProgressBar
                  value={p.progressPercent}
                  size="sm"
                  showPercent
                  className="[--progress-track:var(--asana-bg-input)]"
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
