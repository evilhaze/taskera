"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, Activity, Calendar, Home, CheckSquare, Bell } from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { SidebarBadge } from "./SidebarBadge";

type Project = {
  id: string;
  name: string;
  progressPercent?: number;
};

function NavLink({
  href,
  isActive,
  icon: Icon,
  badge,
  children
}: {
  href: string;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/10 text-[var(--asana-text-primary)]"
          : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--asana-text-secondary)]" aria-hidden />
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {badge}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<{ todayTasksCount: number; unreadNotificationsCount: number }>({
    todayTasksCount: 0,
    unreadNotificationsCount: 0
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) =>
        setProjects(
          Array.isArray(data)
            ? data.map((p: { id: string; name: string; progressPercent?: number }) => ({
                id: p.id,
                name: p.name,
                progressPercent: p.progressPercent ?? 0
              }))
            : []
        )
      );
  }, []);

  useEffect(() => {
    fetch("/api/sidebar-stats")
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) =>
        setStats({
          todayTasksCount: data.todayTasksCount ?? 0,
          unreadNotificationsCount: data.unreadNotificationsCount ?? 0
        })
      );
  }, []);

  const isHome = pathname === "/";
  const isMyTasks = pathname === "/my-tasks";
  const isToday = pathname === "/today";
  const isNotifications = pathname === "/notifications";
  const isTeam = pathname === "/team";
  const isActivity = pathname === "/activity";
  const isCalendar = pathname === "/calendar";
  const projectId = pathname.startsWith("/projects/") ? pathname.split("/")[2] : null;

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-full w-[240px] flex-col border-r border-[var(--asana-border-subtle)] bg-[var(--asana-bg-sidebar)]"
      style={{ width: "240px" }}
    >
      <div className="flex flex-col gap-4 p-3">
        <SidebarSection title="Workspace" defaultOpen={true}>
          <div className="flex flex-col gap-0.5">
            <NavLink href="/" isActive={isHome} icon={Home}>
              Главная
            </NavLink>
            <NavLink href="/today" isActive={isToday} icon={CalendarDays} badge={<SidebarBadge value={stats.todayTasksCount} variant="amber" />}>
              Сегодня
            </NavLink>
            <NavLink href="/my-tasks" isActive={isMyTasks} icon={CheckSquare}>
              Мои задачи
            </NavLink>
            <NavLink href="/notifications" isActive={isNotifications} icon={Bell} badge={<SidebarBadge value={stats.unreadNotificationsCount} variant="violet" />}>
              Уведомления
            </NavLink>
          </div>
        </SidebarSection>

        <SidebarSection title="Team" defaultOpen={false}>
          <div className="flex flex-col gap-0.5">
            <NavLink href="/team" isActive={isTeam} icon={Users}>
              Команда
            </NavLink>
            <NavLink href="/activity" isActive={isActivity} icon={Activity}>
              Активность
            </NavLink>
            <NavLink href="/calendar" isActive={isCalendar} icon={Calendar}>
              Календарь
            </NavLink>
          </div>
        </SidebarSection>

        <SidebarSection title="Projects" defaultOpen={true}>
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
                      className={`flex flex-col gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "bg-white/10 font-medium text-[var(--asana-text-primary)]"
                          : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-[var(--asana-green)]"
                          aria-hidden
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <div
                        className="h-0.5 w-full overflow-hidden rounded-full bg-[var(--asana-bg-input)]"
                        aria-hidden
                      >
                        <div
                          className="h-full rounded-full bg-[var(--progress-fill)] transition-[width] duration-500 ease-out"
                          style={{ width: `${Math.min(100, Math.max(0, p.progressPercent ?? 0))}%` }}
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </SidebarSection>
      </div>
    </aside>
  );
}
