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
  isOverlay
}: {
  task: KanbanTask;
  isOverlay?: boolean;
}) {
  const deadlineStr = formatDeadline(task.deadline);
  return (
    <div
      className={
        "rounded-lg border bg-slate-800/95 p-3 shadow " +
        (isOverlay
          ? "border-sky-500 ring-2 ring-sky-500/50 cursor-grabbing"
          : "border-slate-600 hover:border-slate-500")
      }
    >
      <p className="font-medium text-slate-100">{task.title}</p>
      {task.description && (
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
        {task.assignee && (
          <span title={task.assignee.email}>{task.assignee.email}</span>
        )}
        {deadlineStr && <span>📅 {deadlineStr}</span>}
        <span
          className={
            task.priority === "HIGH"
              ? "text-amber-400"
              : task.priority === "LOW"
                ? "text-slate-500"
                : ""
          }
        >
          {PRIORITY_LABELS[task.priority] ?? task.priority}
        </span>
      </div>
    </div>
  );
}

function DraggableCard({
  task,
  onDelete,
  deletingId
}: {
  task: KanbanTask;
  onDelete: (id: string) => void;
  deletingId: string | null;
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
        (isDragging ? "opacity-50" : "")
      }
    >
      <div className="relative group">
        <TaskCard task={task} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          disabled={deletingId !== null}
          className="absolute top-2 right-2 rounded bg-slate-700/90 px-2 py-0.5 text-xs text-red-300 opacity-0 group-hover:opacity-100 hover:bg-red-950/80 disabled:opacity-50"
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
  deletingId
}: {
  status: string;
  label: string;
  tasks: KanbanTask[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={
        "min-h-[200px] flex-1 min-w-[240px] rounded-lg border-2 border-dashed p-3 transition-colors " +
        (isOver ? "border-sky-500 bg-sky-950/30" : "border-slate-600 bg-slate-900/30")
      }
    >
      <h3 className="mb-2 text-sm font-medium text-slate-400">
        {label} ({tasks.length})
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            deletingId={deletingId}
          />
        ))}
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
};

export function KanbanBoard({
  tasks,
  projectId,
  onTaskMoved,
  onDelete,
  deletingId
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
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
