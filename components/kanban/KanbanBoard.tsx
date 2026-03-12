"use client";

import { useState, useRef, useEffect } from "react";
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
import { Pencil, UserPlus, MessageSquare, Flag, Trash2 } from "lucide-react";
import { TaskModal } from "@/components/tasks/TaskModal";
import { LabelBadge, type LabelShape } from "@/components/labels/LabelBadge";
import { PriorityBadge } from "@/components/priority/PriorityBadge";
import { UserAvatar } from "@/components/avatar/UserAvatar";
import { InlineAddTask } from "@/components/project/InlineAddTask";

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
  commentsCount?: number;
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

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-[var(--asana-text-placeholder)]",
  IN_PROGRESS: "bg-[var(--asana-blue)]",
  REVIEW: "bg-amber-500",
  DONE: "bg-[var(--asana-green)]"
};

function TaskCardHoverActions({
  task,
  members,
  onOpen,
  onDelete,
  deleting,
  onQuickAssign,
  onQuickPriority
}: {
  task: KanbanTask;
  members: { id: string; email: string; name: string | null }[];
  onOpen: () => void;
  onDelete: () => void;
  deleting: boolean;
  onQuickAssign?: (taskId: string, assigneeId: string | null) => void;
  onQuickPriority?: (taskId: string, priority: string) => void;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const assignRef = useRef<HTMLDivElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (
        assignRef.current && !assignRef.current.contains(e.target as Node) &&
        priorityRef.current && !priorityRef.current.contains(e.target as Node)
      ) {
        setAssignOpen(false);
        setPriorityOpen(false);
      }
    }
    if (assignOpen || priorityOpen) {
      document.addEventListener("click", close, true);
      return () => document.removeEventListener("click", close, true);
    }
  }, [assignOpen, priorityOpen]);

  const btn = "flex h-6 w-6 items-center justify-center rounded border-0 bg-[var(--asana-bg-card-hover)] text-[var(--asana-text-secondary)] hover:bg-[var(--asana-blue)]/20 hover:text-[var(--asana-text-primary)] transition-colors";
  return (
    <>
      <button type="button" className={btn} onClick={(e) => { e.stopPropagation(); onOpen(); }} title="Открыть">
        <Pencil className="h-3 w-3" />
      </button>
      {onQuickAssign && (
        <div className="relative" ref={assignRef}>
          <button type="button" className={btn} onClick={(e) => { e.stopPropagation(); setAssignOpen((v) => !v); setPriorityOpen(false); }} title="Назначить">
            <UserPlus className="h-3 w-3" />
          </button>
          {assignOpen && (
            <div className="absolute right-0 top-full z-50 mt-0.5 min-w-[140px] rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-card)] py-1 shadow-lg">
              <button type="button" className="w-full px-2 py-1 text-left text-[11px] text-[var(--asana-text-placeholder)] hover:bg-white/5" onClick={(e) => { e.stopPropagation(); onQuickAssign(task.id, null); setAssignOpen(false); }}>Не назначен</button>
              {members.map((m) => (
                <button key={m.id} type="button" className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] text-[var(--asana-text-primary)] hover:bg-white/5" onClick={(e) => { e.stopPropagation(); onQuickAssign(task.id, m.id); setAssignOpen(false); }}><UserAvatar user={m} size="xs" /><span className="truncate">{m.email}</span></button>
              ))}
            </div>
          )}
        </div>
      )}
      <button type="button" className={btn} onClick={(e) => { e.stopPropagation(); onOpen(); }} title="Комментарии">
        <MessageSquare className="h-3 w-3" />
      </button>
      {onQuickPriority && (
        <div className="relative" ref={priorityRef}>
          <button type="button" className={btn} onClick={(e) => { e.stopPropagation(); setPriorityOpen((v) => !v); setAssignOpen(false); }} title="Приоритет">
            <Flag className="h-3 w-3" />
          </button>
          {priorityOpen && (
            <div className="absolute right-0 top-full z-50 mt-0.5 min-w-[100px] rounded-md border border-[var(--asana-border)] bg-[var(--asana-bg-card)] py-1 shadow-lg">
              {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                <button key={p} type="button" className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] text-[var(--asana-text-primary)] hover:bg-white/5" onClick={(e) => { e.stopPropagation(); onQuickPriority(task.id, p); setPriorityOpen(false); }}>{p === "HIGH" ? "Высокий" : p === "MEDIUM" ? "Средний" : "Низкий"}</button>
              ))}
            </div>
          )}
        </div>
      )}
      <button type="button" className={`${btn} text-[var(--asana-red)] hover:bg-[var(--asana-red)]/10`} onClick={(e) => { e.stopPropagation(); onDelete(); }} disabled={deleting} title="Удалить">
        <Trash2 className="h-3 w-3" />
      </button>
    </>
  );
}

function formatDeadline(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
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
  const commentsCount = task.commentsCount ?? 0;
  return (
    <div
      className={
        "rounded-lg border bg-[var(--asana-bg-card)] p-2.5 transition-all duration-200 " +
        (isOverlay
          ? "border-[var(--asana-blue)]/50 shadow-[0_20px_50px_rgba(0,0,0,0.35)] cursor-grabbing scale-[1.02] ring-2 ring-[var(--asana-blue)]/20 rotate-[1deg]"
          : "border-[var(--asana-border)] shadow-[0_1px_2px_rgba(0,0,0,0.2)]")
      }
    >
      <p className="text-[13px] font-medium leading-snug text-[var(--asana-text-primary)] line-clamp-2">
        {task.title}
      </p>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {task.assignee && (
          <span className="flex shrink-0" title={task.assignee.email}>
            <UserAvatar user={task.assignee} size="xs" />
          </span>
        )}
        {deadlineStr && (
          <span className="text-[11px] text-[var(--asana-text-secondary)]" title={task.deadline ?? undefined}>
            {deadlineStr}
          </span>
        )}
        <span className="shrink-0">
          <PriorityBadge priority={task.priority} size="sm" showLabel={false} />
        </span>
        {hasSubtasks && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--asana-text-placeholder)] tabular-nums">
            <span
              className="inline-block h-1 w-8 overflow-hidden rounded-full bg-[var(--asana-bg-input)]"
              aria-hidden
            >
              <span
                className="block h-full rounded-full bg-[var(--asana-blue)]/70"
                style={{ width: `${subtasks.length ? (completedCount / subtasks.length) * 100 : 0}%` }}
              />
            </span>
            {completedCount}/{subtasks.length}
          </span>
        )}
        {commentsCount > 0 && (
          <span className="text-[11px] text-[var(--asana-text-placeholder)]">
            💬 {commentsCount}
          </span>
        )}
      </div>
      {labels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {labels.slice(0, 3).map((label) => (
            <LabelBadge key={label.id} label={label} small />
          ))}
          {labels.length > 3 && (
            <span className="text-[10px] text-[var(--asana-text-placeholder)]">+{labels.length - 3}</span>
          )}
        </div>
      )}
      {showProjectInCard && task.project && labels.length === 0 && (
        <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--asana-text-placeholder)]">
          <span className="h-1 w-1 rounded-full bg-[var(--asana-green)]" />
          <span className="truncate max-w-[120px]">{task.project.name}</span>
        </div>
      )}
    </div>
  );
}

function DraggableCard({
  task,
  onDelete,
  deletingId,
  showProjectInCard = false,
  onTaskClick,
  members,
  onQuickAssign,
  onQuickPriority
}: {
  task: KanbanTask;
  onDelete: (id: string) => void;
  deletingId: string | null;
  showProjectInCard?: boolean;
  onTaskClick?: (taskId: string) => void;
  members?: { id: string; email: string; name: string | null }[];
  onQuickAssign?: (taskId: string, assigneeId: string | null) => void;
  onQuickPriority?: (taskId: string, priority: string) => void;
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
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <TaskCardHoverActions
            task={task}
            members={members ?? []}
            onOpen={() => onTaskClick?.(task.id)}
            onDelete={() => onDelete(task.id)}
            deleting={deletingId === task.id}
            onQuickAssign={onQuickAssign}
            onQuickPriority={onQuickPriority}
          />
        </div>
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
  onTaskClick,
  projectId,
  inlineAddActive,
  onRequestInlineAdd,
  onInlineAddCreated,
  onInlineAddCancel,
  members,
  onQuickAssign,
  onQuickPriority
}: {
  status: string;
  label: string;
  tasks: KanbanTask[];
  onDelete: (id: string) => void;
  deletingId: string | null;
  onAddTaskInColumn?: () => void;
  showProjectInCard?: boolean;
  onTaskClick?: (taskId: string) => void;
  projectId: string;
  inlineAddActive: boolean;
  onRequestInlineAdd: () => void;
  onInlineAddCreated: () => void;
  onInlineAddCancel: () => void;
  members: { id: string; email: string; name: string | null }[];
  onQuickAssign?: (taskId: string, assigneeId: string | null) => void;
  onQuickPriority?: (taskId: string, priority: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={
        "min-h-[180px] flex-1 min-w-[240px] max-w-[280px] rounded-lg border-2 px-3 py-3 transition-all duration-200 " +
        (isOver
          ? "border-[var(--asana-blue)]/60 bg-[var(--asana-blue)]/10 shadow-[0_0_0_1px_var(--asana-blue)]/30"
          : "border-[var(--asana-border)] bg-[var(--asana-bg-input)]")
      }
    >
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-[var(--asana-text-primary)]">
        <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_COLORS[status] ?? "bg-[var(--asana-text-placeholder)]"}`} aria-hidden />
        {label}{" "}
        <span className="font-normal text-[var(--asana-text-placeholder)]">
          ({tasks.length})
        </span>
      </h3>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <DraggableCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            deletingId={deletingId}
            showProjectInCard={showProjectInCard}
            onTaskClick={onTaskClick}
            members={members}
            onQuickAssign={onQuickAssign}
            onQuickPriority={onQuickPriority}
          />
        ))}
        {isOver && (
          <div
            className="min-h-[56px] rounded-md border-2 border-dashed border-[var(--asana-blue)]/40 bg-[var(--asana-blue)]/10 flex items-center justify-center transition-all duration-200"
            aria-hidden
          >
            <span className="text-[11px] font-medium text-[var(--asana-text-placeholder)]">Отпустите здесь</span>
          </div>
        )}
        {onAddTaskInColumn && !inlineAddActive && (
          <button
            type="button"
            onClick={onRequestInlineAdd}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-[var(--asana-text-placeholder)] hover:bg-white/5 hover:text-[var(--asana-text-primary)] transition-colors"
          >
            <span aria-hidden>+</span>
            Добавить задачу
          </button>
        )}
        {inlineAddActive && (
          <InlineAddTask
            projectId={projectId}
            status={status}
            onCreated={onInlineAddCreated}
            onCancel={onInlineAddCancel}
          />
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
  members?: { id: string; email: string; name: string | null }[];
};

export function KanbanBoard({
  tasks,
  projectId,
  onTaskMoved,
  onDelete,
  deletingId,
  onAddTaskInColumn,
  showProjectInCard = false,
  members = []
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);
  const [inlineAddStatus, setInlineAddStatus] = useState<string | null>(null);
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

  async function handleQuickAssign(taskId: string, assigneeId: string | null) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assigneeId })
    });
    if (res.ok) onTaskMoved();
  }

  async function handleQuickPriority(taskId: string, priority: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority })
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap gap-3">
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
            projectId={projectId}
            inlineAddActive={inlineAddStatus === status}
            onRequestInlineAdd={() => setInlineAddStatus(status)}
            onInlineAddCreated={() => {
              setInlineAddStatus(null);
              onTaskMoved();
            }}
            onInlineAddCancel={() => setInlineAddStatus(null)}
            members={members}
            onQuickAssign={handleQuickAssign}
            onQuickPriority={handleQuickPriority}
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
