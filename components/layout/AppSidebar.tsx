"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, Activity, Calendar, Home, CheckSquare, Bell, Plus, Star, Clock } from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { SidebarBadge } from "./SidebarBadge";

const RECENT_KEY = "sidebar-recent-project-ids";
const FAVORITES_KEY = "sidebar-favorite-project-ids";
const RECENT_MAX = 5;

function getRecentIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistRecentIds(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, RECENT_MAX)));
  } catch {}
}

function getFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavoriteIds(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {}
}

function persistFavoriteIds(ids: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {}
}

function toggleFavorite(id: string, current: string[]) {
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  persistFavoriteIds(next);
  return next;
}

type Project = {
  id: string;
  name: string;
  progressPercent?: number;
};

type AppSidebarProps = {
  initialProjects?: Array<{ id: string; name: string; progressPercent: number }>;
  initialStats?: { todayTasksCount: number; unreadNotificationsCount: number };
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

export function AppSidebar({ initialProjects, initialStats }: AppSidebarProps = {}) {
  const pathname = usePathname();
  const projectId = pathname.startsWith("/app/projects/") ? pathname.split("/")[3] : null;
  const [projects, setProjects] = useState<Project[]>(
    initialProjects?.map((p) => ({ id: p.id, name: p.name, progressPercent: p.progressPercent })) ?? []
  );
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [stats, setStats] = useState<{ todayTasksCount: number; unreadNotificationsCount: number }>({
    todayTasksCount: initialStats?.todayTasksCount ?? 0,
    unreadNotificationsCount: initialStats?.unreadNotificationsCount ?? 0
  });

  useEffect(() => {
    setRecentIds(getRecentIds());
    setFavoriteIds(getFavoriteIds());
  }, []);

  useEffect(() => {
    if (!projectId) return;
    const prev = getRecentIds();
    const next = [projectId, ...prev.filter((id) => id !== projectId)].slice(0, RECENT_MAX);
    persistRecentIds(next);
    setRecentIds(next);
  }, [projectId]);

  useEffect(() => {
    if (initialProjects !== undefined) return;
    fetch("/api/dashboard-data")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: { projects?: Array<{ id: string; name: string; progressPercent?: number }>; sidebarStats?: { todayTasksCount?: number; unreadNotificationsCount?: number } }) => {
        if (Array.isArray(data.projects)) {
          setProjects(
            data.projects.map((p) => ({
              id: p.id,
              name: p.name,
              progressPercent: p.progressPercent ?? 0
            }))
          );
        }
        if (data.sidebarStats) {
          setStats({
            todayTasksCount: data.sidebarStats.todayTasksCount ?? 0,
            unreadNotificationsCount: data.sidebarStats.unreadNotificationsCount ?? 0
          });
        }
      });
  }, [initialProjects]);

  const isHome = pathname === "/app" || pathname === "/app/dashboard";
  const isMyTasks = pathname === "/app/my-tasks";
  const isToday = pathname === "/app/today";
  const isNotifications = pathname === "/app/notifications";
  const isTeam = pathname === "/app/team";
  const isActivity = pathname === "/app/activity";
  const isCalendar = pathname === "/app/calendar";

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-full w-[240px] flex-col border-r border-[var(--asana-border-subtle)] bg-[var(--asana-bg-sidebar)]"
      style={{ width: "240px" }}
    >
      <div className="flex flex-col gap-4 p-3">
        <SidebarSection title="Workspace" defaultOpen={true}>
          <div className="flex flex-col gap-0.5">
            <NavLink href="/app/dashboard" isActive={isHome} icon={Home}>
              Главная
            </NavLink>
            <NavLink href="/app/today" isActive={isToday} icon={CalendarDays} badge={<SidebarBadge value={stats.todayTasksCount} variant="amber" />}>
              Сегодня
            </NavLink>
            <NavLink href="/app/my-tasks" isActive={isMyTasks} icon={CheckSquare}>
              Мои задачи
            </NavLink>
            <NavLink href="/app/notifications" isActive={isNotifications} icon={Bell} badge={<SidebarBadge value={stats.unreadNotificationsCount} variant="violet" />}>
              Уведомления
            </NavLink>
          </div>
        </SidebarSection>

        <SidebarSection title="Team" defaultOpen={false}>
          <div className="flex flex-col gap-0.5">
            <NavLink href="/app/team" isActive={isTeam} icon={Users}>
              Команда
            </NavLink>
            <NavLink href="/app/activity" isActive={isActivity} icon={Activity}>
              Активность
            </NavLink>
            <NavLink href="/app/calendar" isActive={isCalendar} icon={Calendar}>
              Календарь
            </NavLink>
          </div>
        </SidebarSection>

        <SidebarSection title="Projects" defaultOpen={true}>
          <div className="flex flex-col gap-0.5">
            <Link
              href="/app/dashboard?create=project"
              className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--asana-text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              <span>Создать проект</span>
            </Link>
            {recentIds.length > 0 && (
              <>
                <p className="mt-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--asana-text-placeholder)]">Недавние</p>
                <ul className="space-y-0.5">
                  {recentIds.map((id) => {
                    const p = projects.find((x) => x.id === id);
                    if (!p) return null;
                    const isActive = projectId === p.id;
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/app/projects/${p.id}`}
                          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                            isActive ? "bg-white/10 font-medium text-[var(--asana-text-primary)]" : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--asana-text-placeholder)]" />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {favoriteIds.length > 0 && (
              <>
                <p className="mt-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--asana-text-placeholder)]">Избранное</p>
                <ul className="space-y-0.5">
                  {favoriteIds.map((id) => {
                    const p = projects.find((x) => x.id === id);
                    if (!p) return null;
                    const isActive = projectId === p.id;
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/app/projects/${p.id}`}
                          className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                            isActive ? "bg-white/10 font-medium text-[var(--asana-text-primary)]" : "text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)]"
                          }`}
                        >
                          <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                          <span className="truncate">{p.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            <p className="mt-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--asana-text-placeholder)]">Все проекты</p>
            {projects.length === 0 ? (
              <div className="px-2.5 py-1.5 text-sm text-[var(--asana-text-placeholder)]">
                Нет проектов
              </div>
            ) : (
              <ul className="space-y-0.5">
                {projects.map((p) => {
                  const isActive = projectId === p.id;
                  const isFav = favoriteIds.includes(p.id);
                  return (
                    <li key={p.id} className="group flex items-center gap-0.5">
                      <Link
                        href={`/app/projects/${p.id}`}
                        className={`flex flex-1 min-w-0 flex-col gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFavoriteIds((prev) => toggleFavorite(p.id, prev));
                        }}
                        className={`shrink-0 rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 ${isFav ? "text-amber-400" : "text-[var(--asana-text-placeholder)] hover:text-amber-400"}`}
                        title={isFav ? "Убрать из избранного" : "В избранное"}
                      >
                        <Star className={`h-3.5 w-3.5 ${isFav ? "fill-current" : ""}`} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SidebarSection>
      </div>
    </aside>
  );
}
