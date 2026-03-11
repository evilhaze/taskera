"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateTaskForm } from "./CreateTaskForm";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

type Assignee = { id: string; email: string; name: string | null } | null;

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  assignee: Assignee;
  createdAt: string;
};

type Member = { id: string; email: string; name: string | null };

type Props = {
  projectId: string;
  members: Member[];
};

export function TasksSection({ projectId, members }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    if (!res.ok) return;
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }, [projectId]);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  useEffect(() => {
    const onCreated = () => {
      fetchTasks();
      router.refresh();
    };
    window.addEventListener("task-created", onCreated);
    return () => window.removeEventListener("task-created", onCreated);
  }, [fetchTasks, router]);

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

  return (
    <section>
      <h2 className="section-title mb-4">Задачи</h2>

      <div className="mb-6">
        <CreateTaskForm projectId={projectId} members={members} />
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-sm text-[var(--asana-text-secondary)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
            Загрузка задач…
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[var(--asana-text-secondary)]">Задач пока нет.</p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Создайте первую задачу выше.
          </p>
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          projectId={projectId}
          onTaskMoved={fetchTasks}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </section>
  );
}
