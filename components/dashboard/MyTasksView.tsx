"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreateTaskForm } from "@/components/project/CreateTaskForm";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import type { KanbanTask } from "@/components/kanban/KanbanBoard";
import { UserAvatar } from "@/components/avatar/UserAvatar";

type Project = { id: string; name: string };
type Member = { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null };

export function MyTasksView({
  projects,
  user
}: {
  projects: Project[];
  user: { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null };
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/my-tasks");
    if (!res.ok) return;
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  useEffect(() => {
    const onCreated = () => {
      fetchTasks();
      router.refresh();
      setSelectedProjectId(null);
    };
    window.addEventListener("task-created", onCreated);
    return () => window.removeEventListener("task-created", onCreated);
  }, [fetchTasks, router]);

  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([]);
      return;
    }
    setMembersLoading(true);
    fetch(`/api/projects/${selectedProjectId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((p) => {
        if (p?.members) {
          setMembers(
            p.members.map((m: { user: Member }) => ({
              id: m.user.id,
              email: m.user.email,
              name: m.user.name,
              avatarUrl: m.user.avatarUrl ?? undefined,
              avatarEmoji: m.user.avatarEmoji ?? undefined
            }))
          );
        } else setMembers([]);
      })
      .finally(() => setMembersLoading(false));
  }, [selectedProjectId]);

  async function handleDelete(taskId: string) {
    setDeletingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  function openAddTask(projectId: string | null) {
    setSelectedProjectId(projectId);
    setAddTaskOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="page-title text-[var(--asana-text-primary)]">
            Мои задачи
          </h1>
          <UserAvatar user={user} size="sm" title={user.email} />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAddTaskOpen((o) => !o)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <span aria-hidden>+</span>
              Добавить задачу
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {addTaskOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setAddTaskOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-[var(--asana-border)] bg-[var(--asana-bg-card)] py-1 shadow-lg">
                  {projects.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-[var(--asana-text-secondary)]">
                      Нет проектов
                    </p>
                  ) : (
                    projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setAddTaskOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-[var(--asana-text-primary)] hover:bg-white/5"
                      >
                        {p.name}
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
          <Link
            href="/app/dashboard"
            className="btn-secondary text-sm"
          >
            Поделиться
          </Link>
        </div>
      </header>

      {selectedProjectId && (
        <div className="mb-6">
          {membersLoading ? (
            <div className="card flex items-center justify-center py-8">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
            </div>
          ) : (
            <CreateTaskForm
              projectId={selectedProjectId}
              members={members}
            />
          )}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-16">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[var(--asana-text-secondary)]">Задач, назначенных вам, пока нет.</p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Выберите проект выше и создайте задачу или откройте проект и назначьте задачу на себя.
          </p>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          projectId=""
          onTaskMoved={fetchTasks}
          onDelete={handleDelete}
          deletingId={deletingId}
          onAddTaskInColumn={() => openAddTask(null)}
          showProjectInCard
        />
      )}
    </div>
  );
}
