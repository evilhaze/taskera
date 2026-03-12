"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { CreateTaskForm } from "./CreateTaskForm";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TasksToolbar } from "./TasksToolbar";
import { TasksListView } from "./TasksListView";
import { TaskModal } from "@/components/tasks/TaskModal";
import { LabelBadge, type LabelShape } from "@/components/labels/LabelBadge";

type Assignee = { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null } | null;

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
  subtasks?: { id: string; isCompleted: boolean }[];
  commentsCount?: number;
  project?: { id: string; name: string };
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
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [listModalTaskId, setListModalTaskId] = useState<string | null>(null);
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

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (selectedLabelId != null) {
      list = list.filter((t) => t.taskLabels?.some((tl) => tl.label.id === selectedLabelId));
    }
    if (selectedAssigneeId) {
      list = list.filter((t) => t.assignee?.id === selectedAssigneeId);
    }
    if (selectedStatus) {
      list = list.filter((t) => t.status === selectedStatus);
    }
    if (selectedPriority) {
      list = list.filter((t) => t.priority === selectedPriority);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q))
      );
    }
    return list;
  }, [tasks, selectedLabelId, selectedAssigneeId, selectedStatus, selectedPriority, searchQuery]);

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="section-title mb-0">Задачи</h2>
          <div className="flex rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-input)] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${viewMode === "board" ? "bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]" : "text-[var(--asana-text-secondary)] hover:text-[var(--asana-text-primary)]"}`}
              title="Доска"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Доска
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-[var(--asana-blue)]/20 text-[var(--asana-text-primary)]" : "text-[var(--asana-text-secondary)] hover:text-[var(--asana-text-primary)]"}`}
              title="Список"
            >
              <List className="h-3.5 w-3.5" />
              Список
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((v) => !v)}
          className="btn-primary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm"
        >
          <span aria-hidden>+</span>
          Добавить задачу
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-4">
          <CreateTaskForm projectId={projectId} members={members} />
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-sm text-[var(--asana-text-secondary)]">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
            Загрузка задач…
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <p className="text-[var(--asana-text-secondary)]">Задач пока нет.</p>
          <p className="mt-1 text-sm text-[var(--asana-text-placeholder)]">
            Нажмите «Добавить задачу» или кнопку в колонке.
          </p>
        </div>
      ) : (
        <>
          <TasksToolbar
            labels={labels}
            members={members}
            selectedLabelId={selectedLabelId}
            selectedAssigneeId={selectedAssigneeId}
            selectedStatus={selectedStatus}
            selectedPriority={selectedPriority}
            searchQuery={searchQuery}
            onLabelChange={setSelectedLabelId}
            onAssigneeChange={setSelectedAssigneeId}
            onStatusChange={setSelectedStatus}
            onPriorityChange={setSelectedPriority}
            onSearchChange={setSearchQuery}
          />
          {viewMode === "board" && (
            <KanbanBoard
              tasks={filteredTasks}
              projectId={projectId}
              onTaskMoved={fetchTasks}
              onDelete={handleDelete}
              deletingId={deletingId}
              onAddTaskInColumn={() => setShowCreateForm(true)}
              showProjectInCard={false}
              members={members}
            />
          )}
          {viewMode === "list" && (
            <>
              <TasksListView
                tasks={filteredTasks}
                onTaskClick={(id) => setListModalTaskId(id)}
              />
              <TaskModal
                taskId={listModalTaskId}
                open={!!listModalTaskId}
                onClose={() => setListModalTaskId(null)}
                onSaved={() => {
                  fetchTasks();
                  router.refresh();
                }}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
