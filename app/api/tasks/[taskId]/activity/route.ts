import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true }
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

  const limit = Math.min(50, Math.max(10, 20));
  const activities = await prisma.activity.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          avatarEmoji: true
        }
      },
      task: { select: { id: true, title: true } }
    }
  });

  return NextResponse.json(activities);
}
