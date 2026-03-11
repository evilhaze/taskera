"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  description: string | null;
  myRole: string;
  _count: { members: number; tasks: number };
  owner: { id: string; email: string; name: string | null };
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
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-violet-500" />
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
          <p className="text-zinc-500">Проектов пока нет.</p>
          <p className="mt-1 text-sm text-zinc-600">
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
              <span className="font-medium text-zinc-100">{p.name}</span>
              {p.description && (
                <p className="mt-1.5 line-clamp-2 text-sm text-zinc-500">
                  {p.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>{p._count.members} участников</span>
                <span>·</span>
                <span>{p._count.tasks} задач</span>
                {p.myRole === "OWNER" && (
                  <span className="ml-1 rounded-md bg-zinc-700/80 px-2 py-0.5 font-medium text-zinc-300">
                    Владелец
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
