import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createActivity, formatActivityMessage } from "@/lib/activity";

const addCommentSchema = z.object({
  content: z.string().min(1, "Комментарий не может быть пустым").max(5000)
});

async function ensureTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, title: true }
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

  const comments = await prisma.comment.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, name: true } }
    }
  });

  return NextResponse.json(comments);
}

export async function POST(
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

  const parsed = addCommentSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId: user.id,
      content: parsed.data.content.trim()
    },
    include: {
      user: { select: { id: true, email: true, name: true } }
    }
  });

  const message = formatActivityMessage("COMMENT_ADDED", user.name ?? user.email, {
    taskTitle: task.title
  });
  await createActivity({
    userId: user.id,
    projectId: task.projectId,
    type: "COMMENT_ADDED",
    message,
    taskId,
    metadata: { taskTitle: task.title }
  });

  return NextResponse.json(comment, { status: 201 });
}
