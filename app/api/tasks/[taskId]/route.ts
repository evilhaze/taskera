import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";
import { createActivity, formatActivityMessage } from "@/lib/activity";

async function ensureTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
      assignee: { select: { id: true, email: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, email: true, name: true } }
        }
      },
      taskLabels: {
        include: {
          label: true
        }
      }
    }
  });
  if (!task) return null;

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId: task.projectId }
    }
  });
  if (!membership) return null;

  return task;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await ensureTaskAccess(user.id, taskId);
  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await ensureTaskAccess(user.id, taskId);
  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const data = parsed.data;

  if (data.assigneeId !== undefined && data.assigneeId !== null) {
    const assigneeInProject = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: data.assigneeId,
          projectId: task.projectId
        }
      }
    });
    if (!assigneeInProject) {
      return NextResponse.json(
        { message: "Assignee must be a project member" },
        { status: 400 }
      );
    }
  }

  const updatePayload: {
    title?: string;
    description?: string | null;
    assigneeId?: string | null;
    deadline?: Date | null;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    order?: number;
  } = {};

  if (data.title !== undefined) updatePayload.title = data.title;
  if (data.description !== undefined) updatePayload.description = data.description;
  if (data.assigneeId !== undefined) updatePayload.assigneeId = data.assigneeId;
  if (data.deadline !== undefined) {
    updatePayload.deadline =
      data.deadline && data.deadline !== ""
        ? new Date(data.deadline)
        : null;
  }
  if (data.priority !== undefined) updatePayload.priority = data.priority;
  if (data.status !== undefined) updatePayload.status = data.status;
  if (data.order !== undefined) updatePayload.order = data.order;

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updatePayload,
    include: {
      assignee: { select: { id: true, email: true, name: true } },
      project: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, email: true, name: true } }
        }
      },
      taskLabels: {
        include: {
          label: true
        }
      }
    }
  });

  const userName = user.name ?? user.email;
  const taskTitle = updated.title;

  if (updatePayload.title !== undefined && task.title !== updatePayload.title) {
    const message = formatActivityMessage("TASK_UPDATED", userName, {
      taskTitle,
      oldValue: "название",
      newValue: updatePayload.title
    });
    await createActivity({
      userId: user.id,
      projectId: task.projectId,
      type: "TASK_UPDATED",
      message,
      taskId,
      metadata: { taskTitle, oldValue: task.title, newValue: updatePayload.title }
    });
  }
  if (updatePayload.description !== undefined && task.description !== updatePayload.description) {
    const message = formatActivityMessage("TASK_UPDATED", userName, { taskTitle });
    await createActivity({
      userId: user.id,
      projectId: task.projectId,
      type: "TASK_UPDATED",
      message: `${userName} изменил описание задачи «${taskTitle}»`,
      taskId
    });
  }
  if (updatePayload.status !== undefined && task.status !== updatePayload.status) {
    const message = formatActivityMessage("TASK_STATUS_CHANGED", userName, {
      taskTitle,
      newValue: updatePayload.status
    });
    await createActivity({
      userId: user.id,
      projectId: task.projectId,
      type: "TASK_STATUS_CHANGED",
      message,
      taskId,
      metadata: { taskTitle, oldValue: task.status, newValue: updatePayload.status }
    });
  }
  if (
    updatePayload.assigneeId !== undefined &&
    (task.assigneeId ?? null) !== (updatePayload.assigneeId ?? null)
  ) {
    const assigneeEmail = updated.assignee?.email ?? null;
    const message = assigneeEmail
      ? formatActivityMessage("TASK_ASSIGNEE_CHANGED", userName, {
          taskTitle,
          assigneeEmail
        })
      : `${userName} снял исполнителя с задачи «${taskTitle}»`;
    await createActivity({
      userId: user.id,
      projectId: task.projectId,
      type: "TASK_ASSIGNEE_CHANGED",
      message,
      taskId,
      metadata: { taskTitle, assigneeEmail }
    });
  }
  if (updatePayload.priority !== undefined && task.priority !== updatePayload.priority) {
    const message = formatActivityMessage("TASK_PRIORITY_CHANGED", userName, {
      taskTitle,
      newValue: updatePayload.priority
    });
    await createActivity({
      userId: user.id,
      projectId: task.projectId,
      type: "TASK_PRIORITY_CHANGED",
      message,
      taskId,
      metadata: { taskTitle, oldValue: task.priority, newValue: updatePayload.priority }
    });
  }
  if (
    updatePayload.deadline !== undefined &&
    (task.deadline?.toISOString() ?? null) !==
      (updatePayload.deadline?.toISOString() ?? null)
  ) {
    const deadlineStr = updatePayload.deadline
      ? updatePayload.deadline.toLocaleString("ru-RU")
      : "не указан";
    const message = formatActivityMessage("TASK_DEADLINE_CHANGED", userName, {
      taskTitle,
      newValue: deadlineStr
    });
    await createActivity({
      userId: user.id,
      projectId: task.projectId,
      type: "TASK_DEADLINE_CHANGED",
      message,
      taskId,
      metadata: { taskTitle, newValue: deadlineStr }
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  const task = await ensureTaskAccess(user.id, taskId);
  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({
    where: { id: taskId }
  });

  return NextResponse.json({ ok: true });
}
