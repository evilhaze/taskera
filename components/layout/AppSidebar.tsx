"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Project = {
  id: string;
  name: string;
};

export function AppSidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setProjects(Array.isArray(data) ? data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })) : []));
  }, []);

  const isHome = pathname === "/";
  const projectId = pathname.startsWith("/projects/") ? pathname.split("/")[2] : null;

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-full w-[240px] flex-col border-r border-[var(--asana-border-subtle)] bg-[var(--asana-bg-sidebar)]"
      style={{ width: "240px" }}
    >
      <div className="flex flex-col gap-1 p-2">
        <Link
          href="/"
          className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
            isHome
              ? "bg-white/10 text-[var(--asana-text-primary)]"
              : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
          }`}
        >
          <span className="text-[var(--asana-text-secondary)]">⌂</span>
          Главная
        </Link>

        <div className="mt-3 px-2.5 pb-1 pt-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--asana-text-secondary)]">
            Проекты
          </span>
        </div>
        {projects.length === 0 ? (
          <div className="px-2.5 py-1.5 text-sm text-[var(--asana-text-placeholder)]">
            Нет проектов
          </div>
        ) : (
          <ul className="space-y-0.5">
            {projects.map((p) => {
              const isActive = projectId === p.id;
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                      isActive
                        ? "bg-white/10 font-medium text-[var(--asana-text-primary)]"
                        : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-[var(--asana-green)]"
                      aria-hidden
                    />
                    <span className="truncate">{p.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
