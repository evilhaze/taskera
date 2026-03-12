"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  defaultDropAnimation
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TaskModal } from "@/components/tasks/TaskModal";
import { LabelBadge, type LabelShape } from "@/components/labels/LabelBadge";
import { PriorityBadge } from "@/components/priority/PriorityBadge";
import { UserAvatar } from "@/components/avatar/UserAvatar";

type Assignee = { id: string; email: string; name: string | null; avatarUrl?: string | null; avatarEmoji?: string | null } | null;

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  assignee: Assignee;
  createdAt: string;
  project?: { id: string; name: string };
  taskLabels?: { label: LabelShape }[];
  subtasks?: { id: string; isCompleted: boolean }[];
};

const STATUS_ORDER: readonly string[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE"
];

const STATUS_LABELS: Record<string, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  REVIEW: "На проверке",
  DONE: "Готово"
};

function formatDeadline(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function TaskCard({
  task,
  isOverlay,
  showProjectInCard = false
}: {
  task: KanbanTask;
  isOverlay?: boolean;
  showProjectInCard?: boolean;
}) {
  const deadlineStr = formatDeadline(task.deadline);
  const labels = task.taskLabels?.map((tl) => tl.label) ?? [];
  const subtasks = task.subtasks ?? [];
  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const hasSubtasks = subtasks.length > 0;
  return (
    <div
      className={
        "rounded-lg border bg-[var(--asana-bg-card)] p-3.5 transition-all duration-200 " +
        (isOverlay
          ? "border-[var(--asana-blue)]/50 shadow-[0_20px_50px_rgba(0,0,0,0.35)] cursor-grabbing scale-[1.02] ring-2 ring-[var(--asana-blue)]/20 rotate-[1deg]"
          : "border-[var(--asana-border)] shadow-[0_1px_3px_rgba(0,0,0,0.25)]")
      }
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-[var(--asana-text-placeholder)]" aria-hidden>
          ☐
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-[var(--asana-text-primary)]">{task.title}</p>
          {hasSubtasks && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 min-w-[60px] max-w-[100px] overflow-hidden rounded-full bg-[var(--asana-bg-input)]">
                <div
                  className="h-full rounded-full bg-[var(--asana-blue)]/70 transition-all duration-200"
                  style={{ width: `${subtasks.length ? (completedCount / subtasks.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[var(--asana-text-placeholder)] tabular-nums">
                {completedCount}/{subtasks.length}
              </span>
            </div>
          )}
          {(labels.length > 0 || (showProjectInCard && task.project) || task.assignee || deadlineStr || task.priority) ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-[var(--asana-text-secondary)]">
              {labels.length > 0 && (
                <span className="flex flex-wrap gap-1">
                  {labels.map((label) => (
                    <LabelBadge key={label.id} label={label} small />
                  ))}
                </span>
              )}
              {showProjectInCard && task.project && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--asana-green)]" />
                  <span className="truncate max-w-[140px]" title={task.project.name}>{task.project.name}</span>
                </span>
              )}
              {task.assignee ? (
                <span className="flex items-center gap-1.5" title={task.assignee.email}>
                  <UserAvatar user={task.assignee} size="xs" />
                  <span className="max-w-[100px] truncate">{task.assignee.email}</span>
                </span>
              ) : (
                <UserAvatar user={null} size="xs" title="Не назначен" />
              )}
              {deadlineStr && <span>{deadlineStr}</span>}
              <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DraggableCard({
  task,
  onDelete,
  deletingId,
  showProjectInCard = false,
  onTaskClick
}: {
  task: KanbanTask;
  onDelete: (id: string) => void;
  deletingId: string | null;
  showProjectInCard?: boolean;
  onTaskClick?: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: task.id,
    data: { task }
  });

  const style = !isDragging && transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onTaskClick?.(task.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTaskClick?.(task.id);
        }
      }}
      role="button"
      tabIndex={0}
      className={
        "cursor-grab active:cursor-grabbing touch-none rounded-lg outline-none transition-all duration-200 " +
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] " +
        "focus:ring-2 focus:ring-[var(--asana-blue)]/50 focus:ring-offset-2 focus:ring-offset-[var(--asana-bg-input)] " +
        (isDragging ? "opacity-40 scale-[0.98]" : "opacity-100")
      }
    >
      <div className="relative group">
        <TaskCard task={task} showProjectInCard={showProjectInCard} />
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(task.id);
          }}
          disabled={deletingId !== null}
          className="absolute top-2 right-2 rounded-md bg-[var(--asana-bg-card-hover)] px-2 py-1 text-xs font-medium text-[var(--asana-red)] opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--asana-red)]/10 disabled:opacity-50"
        >
          {deletingId === task.id ? "…" : "Удалить"}
        </button>
      </div>
    </div>
  );
}

function DroppableColumn({
  status,
  label,
  tasks,
  onDelete,
  deletingId,
  onAddTaskInColumn,
  showProjectInCard,
  onTaskClick
}: {
  status: string;
  label: string;
  tasks: KanbanTask[];
  onDelete: (id: string) => void;
  deletingId: string | null;
  onAddTaskInColumn?: () => void;
  showProjectInCard?: boolean;
  onTaskClick?: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={
        "min-h-[220px] flex-1 min-w-[260px] max-w-[320px] rounded-xl border-2 px-4 py-4 transition-all duration-200 " +
        (isOver
          ? "border-[var(--asana-blue)]/60 bg-[var(--asana-blue)]/10 shadow-[0_0_0_1px_var(--asana-blue)]/30"
          : "border-[var(--asana-border)] bg-[var(--asana-bg-input)]")
      }
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--asana-text-primary)]">
        {label}{" "}
        <span className="font-normal text-[var(--asana-text-secondary)]">
          ({tasks.length})
        </span>
      </h3>
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            deletingId={deletingId}
            showProjectInCard={showProjectInCard}
            onTaskClick={onTaskClick}
          />
        ))}
        {isOver && (
          <div
            className="min-h-[72px] rounded-lg border-2 border-dashed border-[var(--asana-blue)]/40 bg-[var(--asana-blue)]/10 flex items-center justify-center transition-all duration-200"
            aria-hidden
          >
            <span className="text-xs font-medium text-[var(--asana-text-placeholder)]">Отпустите здесь</span>
          </div>
        )}
        {onAddTaskInColumn && (
          <button
            type="button"
            onClick={onAddTaskInColumn}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-[var(--asana-text-secondary)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors"
          >
            <span aria-hidden>+</span>
            Добавить задачу
          </button>
        )}
      </div>
    </div>
  );
}

type Props = {
  tasks: KanbanTask[];
  projectId: string;
  onTaskMoved: () => void;
  onDelete: (taskId: string) => Promise<void>;
  deletingId: string | null;
  onAddTaskInColumn?: () => void;
  showProjectInCard?: boolean;
};

export function KanbanBoard({
  tasks,
  projectId,
  onTaskMoved,
  onDelete,
  deletingId,
  onAddTaskInColumn,
  showProjectInCard = false
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);
  const justDraggedRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId) ?? null
    : null;

  function handleDragStart(e: DragStartEvent) {
    justDraggedRef.current = false;
    setActiveId(e.active.id as string);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    justDraggedRef.current = true;
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 150);
    const { active, over } = e;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (!STATUS_ORDER.includes(newStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    if (res.ok) onTaskMoved();
  }

  function handleTaskClick(taskId: string) {
    if (justDraggedRef.current) return;
    setModalTaskId(taskId);
    setModalOpen(true);
  }

  const byStatus = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<string, KanbanTask[]>
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap gap-5">
        {STATUS_ORDER.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            label={STATUS_LABELS[status]}
            tasks={byStatus[status] ?? []}
            onDelete={(id) => onDelete(id)}
            deletingId={deletingId}
            onAddTaskInColumn={onAddTaskInColumn}
            showProjectInCard={showProjectInCard}
            onTaskClick={handleTaskClick}
          />
        ))}
      </div>

      <TaskModal
        taskId={modalTaskId}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalTaskId(null);
        }}
        onSaved={onTaskMoved}
      />

      <DragOverlay
        dropAnimation={{
          ...defaultDropAnimation,
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)"
        }}
      >
        {activeTask ? <TaskCard task={activeTask} isOverlay showProjectInCard={showProjectInCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
