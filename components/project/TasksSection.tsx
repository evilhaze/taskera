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
    <section className="mb-8">
      <h2 className="text-lg font-medium text-slate-200 mb-3">Задачи</h2>

      <div className="mb-6">
        <CreateTaskForm projectId={projectId} members={members} />
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Загрузка задач…</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 text-center text-slate-400">
          Задач пока нет. Создайте первую задачу выше.
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
