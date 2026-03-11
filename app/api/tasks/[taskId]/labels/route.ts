import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskLabelsSchema } from "@/lib/validations/label";
import { createActivity, formatActivityMessage } from "@/lib/activity";

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

  const parsed = taskLabelsSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { labelIds } = parsed.data;

  const labelsInProject = await prisma.label.findMany({
    where: { projectId: task.projectId },
    select: { id: true }
  });
  const validIds = new Set(labelsInProject.map((l) => l.id));
  const toSet = labelIds.filter((id) => validIds.has(id));

  await prisma.$transaction([
    prisma.taskLabel.deleteMany({ where: { taskId } }),
    ...(toSet.length > 0
      ? [
          prisma.taskLabel.createMany({
            data: toSet.map((labelId) => ({ taskId, labelId }))
          })
        ]
      : [])
  ]);

  const labels = await prisma.label.findMany({
    where: { taskLabels: { some: { taskId } } },
    orderBy: { name: "asc" }
  });

  const message =
    labels.length > 0
      ? formatActivityMessage("LABEL_ADDED", user.name ?? user.email, {
          taskTitle: task.title,
          labelName: labels.map((l) => l.name).join(", ")
        })
      : formatActivityMessage("LABEL_REMOVED", user.name ?? user.email, {
          taskTitle: task.title
        });
  await createActivity({
    userId: user.id,
    projectId: task.projectId,
    type: labels.length > 0 ? "LABEL_ADDED" : "LABEL_REMOVED",
    message,
    taskId,
    metadata: { taskTitle: task.title, labelNames: labels.map((l) => l.name) }
  });

  return NextResponse.json({ labelIds: labels.map((l) => l.id), labels });
}
