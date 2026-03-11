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

  function onProjectCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
  }

  if (loading) {
    return (
      <p className="text-slate-400 text-sm">Загрузка проектов...</p>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
        <p className="mb-2">Проектов пока нет.</p>
        <p className="text-sm">Создайте первый проект с помощью формы выше.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-slate-200">Мои проекты</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="block rounded-lg border border-slate-700 bg-slate-800/80 p-4 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <span className="font-medium text-slate-100">{p.name}</span>
              {p.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                  {p.description}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                <span>{p._count.members} участников</span>
                <span>{p._count.tasks} задач</span>
                {p.myRole === "OWNER" && (
                  <span className="rounded bg-slate-700 px-1.5 py-0.5 text-slate-300">
                    Владелец
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
