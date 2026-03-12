"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  FormEvent
} from "react";
import { LabelPicker } from "@/components/labels/LabelPicker";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { PriorityBadge } from "@/components/priority/PriorityBadge";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import type { ActivityItemType } from "@/components/activity/ActivityItem";

type User = { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null };
type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: User;
};
type LabelShape = { id: string; name: string; color: string };
type SubtaskShape = {
  id: string;
  title: string;
  isCompleted: boolean;
  taskId: string;
  createdAt: string;
};
type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  assigneeId: string | null;
  assignee: User | null;
  projectId: string;
  project?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  taskLabels?: { label: LabelShape }[];
  subtasks?: SubtaskShape[];
};
type Member = { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function deadlineToInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_OPTIONS = [
  { value: "TODO", label: "К выполнению" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "REVIEW", label: "На проверке" },
  { value: "DONE", label: "Готово" }
];
const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Низкий" },
  { value: "MEDIUM", label: "Средний" },
  { value: "HIGH", label: "Высокий" }
];

type Props = {
  taskId: string | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function TaskModal({ taskId, open, onClose, onSaved }: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedAssigneeId, setEditedAssigneeId] = useState("");
  const [editedPriority, setEditedPriority] = useState("MEDIUM");
  const [editedDeadline, setEditedDeadline] = useState("");
  const [editedStatus, setEditedStatus] = useState("TODO");

  const [taskActivities, setTaskActivities] = useState<ActivityItemType[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [subtaskSending, setSubtaskSending] = useState(false);
  const [subtaskTogglingId, setSubtaskTogglingId] = useState<string | null>(null);
  const [subtaskDeletingId, setSubtaskDeletingId] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(false);
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  // Перенос фокуса в модалку при открытии, чтобы не оставаться в поле поиска шапки
  useEffect(() => {
    if (!open) return;
    const el = contentRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open, mounted]);

  const fetchTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as Task;
  }, []);

  useEffect(() => {
    if (!open || !taskId) {
      setTask(null);
      setMembers([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchTask(taskId)
      .then((t) => {
        if (t) {
          setTask(t);
          setEditedTitle(t.title);
          setEditedDescription(t.description ?? "");
          setEditedAssigneeId(t.assigneeId ?? "");
          setEditedPriority(t.priority ?? "MEDIUM");
          setEditedDeadline(deadlineToInputValue(t.deadline));
          setEditedStatus(t.status ?? "TODO");
          return fetch(`/api/projects/${t.projectId}`)
            .then((r) => (r.ok ? r.json() : null))
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
            });
        }
      })
      .catch(() => setError("Не удалось загрузить задачу"))
      .finally(() => setLoading(false));
  }, [open, taskId, fetchTask]);

  useEffect(() => {
    if (!open || !taskId) {
      setTaskActivities([]);
      return;
    }
    fetch(`/api/tasks/${taskId}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTaskActivities(Array.isArray(data) ? data : []));
  }, [open, taskId]);

  const refetchTaskActivity = useCallback(() => {
    if (!taskId) return;
    fetch(`/api/tasks/${taskId}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTaskActivities(Array.isArray(data) ? data : []));
  }, [taskId]);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!taskId || !task) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle.trim(),
          description: editedDescription.trim() || null,
          assigneeId: editedAssigneeId || null,
          priority: editedPriority,
          deadline: editedDeadline ? new Date(editedDeadline).toISOString() : null,
          status: editedStatus
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Не удалось сохранить");
        return;
      }
      setTask(data);
      refetchTaskActivity();
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    const content = commentText.trim();
    if (!taskId || !content) return;
    setCommentSending(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && task) {
        setTask({
          ...task,
          comments: [...(task.comments ?? []), data]
        });
        setCommentText("");
        refetchTaskActivity();
      }
    } finally {
      setCommentSending(false);
    }
  }

  async function handleAddSubtask(e: FormEvent) {
    e.preventDefault();
    const title = newSubtaskTitle.trim();
    if (!taskId || !title || !task) return;
    setSubtaskSending(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.id) {
        setTask({
          ...task,
          subtasks: [...(task.subtasks ?? []), { ...data, createdAt: data.createdAt ?? new Date().toISOString() }]
        });
        setNewSubtaskTitle("");
        refetchTaskActivity();
        onSaved?.();
      }
    } finally {
      setSubtaskSending(false);
    }
  }

  async function handleToggleSubtask(subtaskId: string, isCompleted: boolean) {
    if (!task) return;
    setSubtaskTogglingId(subtaskId);
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTask({
          ...task,
          subtasks: (task.subtasks ?? []).map((s) =>
            s.id === subtaskId ? { ...s, isCompleted: data.isCompleted ?? isCompleted } : s
          )
        });
        refetchTaskActivity();
        onSaved?.();
      }
    } finally {
      setSubtaskTogglingId(null);
    }
  }

  async function handleDeleteSubtask(subtaskId: string) {
    if (!task) return;
    setSubtaskDeletingId(subtaskId);
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" });
      if (res.ok) {
        setTask({
          ...task,
          subtasks: (task.subtasks ?? []).filter((s) => s.id !== subtaskId)
        });
        refetchTaskActivity();
        onSaved?.();
      }
    } finally {
      setSubtaskDeletingId(null);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-200 ${
        mounted ? "bg-black/60 opacity-100" : "bg-black/0 opacity-0"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-[var(--asana-border)] bg-[var(--asana-bg-card)] shadow-2xl transition-all duration-200 ease-out outline-none ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--asana-border-subtle)] px-6 py-4">
          {loading ? (
            <div className="h-8 w-48 animate-pulse rounded bg-[var(--asana-bg-input)]" />
          ) : (
            <input
              id="task-modal-title"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-[var(--asana-text-primary)] placeholder-[var(--asana-text-placeholder)] outline-none"
              placeholder="Название задачи"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-[var(--asana-text-secondary)] hover:bg-white/10 hover:text-[var(--asana-text-primary)] transition-colors"
            aria-label="Закрыть"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {loading ? (
            <div className="flex flex-1 items-center justify-center p-12">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--asana-border)] border-t-[var(--asana-blue)]" />
            </div>
          ) : task ? (
            <div className="grid gap-6 p-6 lg:grid-cols-[1fr,280px]">
              {/* Left: Description + Subtasks + Comments */}
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--asana-text-secondary)]">
                    Описание
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                    maxLength={5000}
                    className="input-base min-h-[80px] resize-y"
                    placeholder="Добавьте описание…"
                  />
                </div>

                {/* Subtasks */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[var(--asana-text-primary)]">
                    Подзадачи
                  </h3>
                  <ul className="space-y-1">
                    {(task.subtasks ?? []).map((s) => (
                      <li
                        key={s.id}
                        className="group flex items-center gap-3 rounded-md py-1.5 pr-1 transition-colors hover:bg-[var(--asana-bg-input)]/40"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(s.id, !s.isCompleted)}
                          disabled={subtaskTogglingId === s.id}
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--asana-border)] bg-[var(--asana-bg-input)] transition-colors hover:border-[var(--asana-text-secondary)] disabled:opacity-50"
                          aria-label={s.isCompleted ? "Отметить невыполненной" : "Отметить выполненной"}
                        >
                          {s.isCompleted ? (
                            <svg className="h-3.5 w-3.5 text-[var(--asana-blue)]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : null}
                        </button>
                        <span
                          className={`min-w-0 flex-1 text-sm ${
                            s.isCompleted
                              ? "text-[var(--asana-text-placeholder)] line-through"
                              : "text-[var(--asana-text-primary)]"
                          }`}
                        >
                          {s.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubtask(s.id)}
                          disabled={subtaskDeletingId === s.id}
                          className="shrink-0 rounded p-1.5 text-[var(--asana-text-placeholder)] opacity-0 transition-opacity hover:bg-white/10 hover:text-[var(--asana-red)] group-hover:opacity-100 disabled:opacity-50"
                          aria-label="Удалить подзадачу"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
                    <input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Добавить подзадачу…"
                      className="input-base flex-1 text-sm"
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={subtaskSending || !newSubtaskTitle.trim()}
                      className="btn-secondary shrink-0 text-sm"
                    >
                      {subtaskSending ? "…" : "Добавить"}
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[var(--asana-text-primary)]">
                    Комментарии
                  </h3>
                  <ul className="space-y-3">
                    {(task.comments ?? []).map((c) => (
                      <li
                        key={c.id}
                        className="flex gap-3 rounded-lg border border-[var(--asana-border-subtle)] bg-[var(--asana-bg-input)]/50 px-3 py-2.5"
                      >
                        <UserAvatar user={c.user} size="sm" className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[var(--asana-text-primary)]">{c.content}</p>
                          <p className="mt-1.5 text-xs text-[var(--asana-text-placeholder)]">
                            {c.user.name || c.user.email} · {formatDate(c.createdAt)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
                    <input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Написать комментарий…"
                      className="input-base flex-1"
                      maxLength={5000}
                    />
                    <button
                      type="submit"
                      disabled={commentSending || !commentText.trim()}
                      className="btn-secondary shrink-0"
                    >
                      {commentSending ? "…" : "Отправить"}
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[var(--asana-text-primary)]">
                    Активность
                  </h3>
                  <ul className="space-y-2 text-sm text-[var(--asana-text-secondary)]">
                    <li>Создано {formatDate(task.createdAt)}</li>
                    {task.updatedAt !== task.createdAt && (
                      <li>Обновлено {formatDate(task.updatedAt)}</li>
                    )}
                  </ul>
                  <div className="mt-3">
                    <ActivityFeed
                      activities={taskActivities}
                      emptyMessage="Нет записей по этой задаче"
                      compact
                    />
                  </div>
                </div>
              </div>

              {/* Right: Properties */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                    Исполнитель
                  </label>
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const selected = editedAssigneeId
                        ? members.find((m) => m.id === editedAssigneeId) ?? task.assignee
                        : null;
                      return (
                        <UserAvatar
                          user={selected ?? null}
                          size="sm"
                        />
                      );
                    })()}
                    <select
                      value={editedAssigneeId}
                      onChange={(e) => setEditedAssigneeId(e.target.value)}
                      className="input-base flex-1"
                    >
                      <option value="">Не назначен</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.email}
                          {m.name ? ` (${m.name})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                    Приоритет
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge
                      priority={editedPriority as "LOW" | "MEDIUM" | "HIGH"}
                      size="md"
                      showLabel
                    />
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value)}
                      className="input-base flex-1 min-w-[120px]"
                    >
                      {PRIORITY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                    Дедлайн
                  </label>
                  <input
                    type="datetime-local"
                    value={editedDeadline}
                    onChange={(e) => setEditedDeadline(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                    Статус
                  </label>
                  <select
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    className="input-base"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[var(--asana-text-secondary)]">
                    Метки
                  </label>
                  <LabelPicker
                    projectId={task.projectId}
                    taskId={task.id}
                    selectedLabels={task.taskLabels?.map((tl) => tl.label) ?? []}
                    onUpdate={(labels) => {
                      setTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              taskLabels: labels.map((label) => ({ label }))
                            }
                          : null
                      );
                      refetchTaskActivity();
                      onSaved?.();
                    }}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-sm text-[var(--asana-red)]">{error}</div>
          ) : null}
        </div>

        {/* Footer */}
        {task && (
          <div className="shrink-0 border-t border-[var(--asana-border-subtle)] px-6 py-4">
            {error && (
              <p className="mb-3 text-sm text-[var(--asana-red)]">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn-secondary">
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
