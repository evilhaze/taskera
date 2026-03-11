import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";

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
