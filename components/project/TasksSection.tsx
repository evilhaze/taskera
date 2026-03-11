"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreateTaskForm } from "./CreateTaskForm";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { LabelBadge, type LabelShape } from "@/components/labels/LabelBadge";

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
  taskLabels?: { label: LabelShape }[];
};

type Member = { id: string; email: string; name: string | null };

type Props = {
  projectId: string;
  members: Member[];
};

export function TasksSection({ projectId, members }: Props) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<LabelShape[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchTasks = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    if (!res.ok) return;
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
  }, [projectId]);

  const fetchLabels = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/labels`);
    if (!res.ok) return;
    const data = await res.json();
    setLabels(Array.isArray(data) ? data : []);
  }, [projectId]);

  useEffect(() => {
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  useEffect(() => {
    const onCreated = () => {
      fetchTasks();
      fetchLabels();
      router.refresh();
      setShowCreateForm(false);
    };
    window.addEventListener("task-created", onCreated);
    return () => window.removeEventListener("task-created", onCreated);
  }, [fetchTasks, fetchLabels, router]);

  const filteredTasks =
    selectedLabelId == null
      ? tasks
      : tasks.filter((t) =>
          t.taskLabels?.some((tl) => tl.label.id === selectedLabelId)
        );

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="section-title mb-0">Задачи</h2>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <span aria-hidden>+</span>
          Добавить задачу
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreateTaskForm projectId={projectId} members={members} />
        </div>
      )}

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
            Нажмите «Добавить задачу» или кнопку в колонке.
          </p>
        </div>
      ) : (
        <>
          {labels.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--asana-text-secondary)]">
                Метка:
              </span>
              <button
                type="button"
                onClick={() => setSelectedLabelId(null)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedLabelId === null
                    ? "border-[var(--asana-blue)] bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]"
                    : "border-[var(--asana-border)] bg-transparent text-[var(--asana-text-secondary)] hover:bg-white/5"
                }`}
              >
                Все
              </button>
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    setSelectedLabelId((id) => (id === label.id ? null : label.id))
                  }
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    selectedLabelId === label.id
                      ? "border-[var(--asana-blue)] bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]"
                      : "border-[var(--asana-border)] bg-transparent text-[var(--asana-text-secondary)] hover:bg-white/5"
                  }`}
                >
                  <LabelBadge label={label} small />
                </button>
              ))}
            </div>
          )}
          <KanbanBoard
            tasks={filteredTasks}
            projectId={projectId}
            onTaskMoved={fetchTasks}
            onDelete={handleDelete}
            deletingId={deletingId}
            onAddTaskInColumn={() => setShowCreateForm(true)}
          />
        </>
      )}
    </section>
  );
}
