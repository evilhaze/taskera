import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createActivity, formatActivityMessage } from "@/lib/activity";

const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional()
});

async function ensureSubtaskAccess(userId: string, subtaskId: string) {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: {
      task: {
        select: { id: true, projectId: true, title: true }
      }
    }
  });
  if (!subtask) return null;

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId: subtask.task.projectId }
    }
  });
  if (!membership) return null;

  return subtask;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { subtaskId } = await params;
  const subtask = await ensureSubtaskAccess(user.id, subtaskId);
  if (!subtask) {
    return NextResponse.json({ message: "Subtask not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSubtaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const data = parsed.data;
  const updatePayload: { title?: string; isCompleted?: boolean } = {};
  if (data.title !== undefined) updatePayload.title = data.title.trim();
  if (data.isCompleted !== undefined) updatePayload.isCompleted = data.isCompleted;

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: updatePayload
  });

  const taskId = subtask.task.id;
  const projectId = subtask.task.projectId;
  const taskTitle = subtask.task.title;
  const userName = user.name ?? user.email;
  const subtaskTitle = updated.title;

  if (
    updatePayload.isCompleted === true &&
    subtask.isCompleted !== true
  ) {
    const message = formatActivityMessage("SUBTASK_COMPLETED", userName, {
      taskTitle,
      subtaskTitle
    });
    await createActivity({
      userId: user.id,
      projectId,
      type: "SUBTASK_COMPLETED",
      message,
      taskId,
      metadata: { taskTitle, subtaskTitle }
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { subtaskId } = await params;
  const subtask = await ensureSubtaskAccess(user.id, subtaskId);
  if (!subtask) {
    return NextResponse.json({ message: "Subtask not found" }, { status: 404 });
  }

  const taskId = subtask.task.id;
  const projectId = subtask.task.projectId;
  const taskTitle = subtask.task.title;
  const subtaskTitle = subtask.title;

  await prisma.subtask.delete({
    where: { id: subtaskId }
  });

  const message = formatActivityMessage("SUBTASK_DELETED", user.name ?? user.email, {
    taskTitle,
    subtaskTitle
  });
  await createActivity({
    userId: user.id,
    projectId,
    type: "SUBTASK_DELETED",
    message,
    taskId,
    metadata: { taskTitle, subtaskTitle }
  });

  return NextResponse.json({ ok: true });
}
