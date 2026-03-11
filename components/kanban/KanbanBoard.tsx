"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

type Assignee = { id: string; email: string; name: string | null } | null;

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

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий"
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
  return (
    <div
      className={
        "rounded-lg border bg-[var(--asana-bg-card)] p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-colors " +
        (isOverlay
          ? "border-[var(--asana-blue)]/60 shadow-[0_8px_24px_rgba(0,0,0,0.5)] cursor-grabbing opacity-95"
          : "border-[var(--asana-border)] hover:bg-[var(--asana-bg-card-hover)] hover:border-[#4A4A62] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]")
      }
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 shrink-0 text-[var(--asana-text-placeholder)]" aria-hidden>
          ☐
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-[var(--asana-text-primary)]">{task.title}</p>
          {(showProjectInCard && task.project) || task.assignee || deadlineStr ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--asana-text-secondary)]">
              {showProjectInCard && task.project && (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--asana-green)]" />
                  <span className="truncate max-w-[140px]" title={task.project.name}>{task.project.name}</span>
                </span>
              )}
              {task.assignee && (
                <span title={task.assignee.email} className="max-w-[100px] truncate">
                  {task.assignee.email}
                </span>
              )}
              {deadlineStr && <span>{deadlineStr}</span>}
              <span
                className={
                  task.priority === "HIGH"
                    ? "font-medium text-[#FF7070]"
                    : task.priority === "LOW"
                      ? "text-[var(--asana-text-placeholder)]"
                      : ""
                }
              >
                {PRIORITY_LABELS[task.priority] ?? task.priority}
              </span>
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
  showProjectInCard = false
}: {
  task: KanbanTask;
  onDelete: (id: string) => void;
  deletingId: string | null;
  showProjectInCard?: boolean;
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

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform)
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        "cursor-grab active:cursor-grabbing " +
        (isDragging ? "opacity-40" : "")
      }
    >
      <div className="relative group">
        <TaskCard task={task} showProjectInCard={showProjectInCard} />
        <button
          type="button"
          onClick={(e) => {
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
  showProjectInCard
}: {
  status: string;
  label: string;
  tasks: KanbanTask[];
  onDelete: (id: string) => void;
  deletingId: string | null;
  onAddTaskInColumn?: () => void;
  showProjectInCard?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={
        "min-h-[220px] flex-1 min-w-[280px] rounded-none border-0 bg-[var(--asana-bg-content)] px-2 py-4 transition-colors " +
        (isOver ? "ring-2 ring-inset ring-[var(--asana-blue)]/50" : "")
      }
    >
      <h3 className="mb-3 text-sm font-semibold text-[var(--asana-text-primary)]">
        {label}{" "}
        <span className="font-normal text-[var(--asana-text-secondary)]">
          ({tasks.length})
        </span>
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            deletingId={deletingId}
            showProjectInCard={showProjectInCard}
          />
        ))}
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

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId) ?? null
    : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as string);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
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

  const byStatus = STATUS_ORDER.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<string, KanbanTask[]>
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-wrap gap-4">
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
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay showProjectInCard={showProjectInCard} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
