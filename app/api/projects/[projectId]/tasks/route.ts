import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/lib/validations/task";
import { createActivity, formatActivityMessage } from "@/lib/activity";

async function ensureProjectAccess(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return membership;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const membership = await ensureProjectAccess(user.id, projectId);
  if (!membership) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, email: true, name: true } },
      taskLabels: {
        include: {
          label: true
        }
      }
    },
    orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json(tasks);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const membership = await ensureProjectAccess(user.id, projectId);
  if (!membership) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { title, description, assigneeId, deadline, priority, status } =
    parsed.data;

  const deadlineDate =
    deadline && deadline !== "" ? new Date(deadline) : null;

  if (assigneeId) {
    const assigneeInProject = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: { userId: assigneeId, projectId }
      }
    });
    if (!assigneeInProject) {
      return NextResponse.json(
        { message: "Assignee must be a project member" },
        { status: 400 }
      );
    }
  }

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description: description ?? null,
      assigneeId: assigneeId || null,
      deadline: deadlineDate,
      priority: priority ?? "MEDIUM",
      status: status ?? "TODO",
      order: 0
    },
    include: {
      assignee: { select: { id: true, email: true, name: true } }
    }
  });

  const message = formatActivityMessage("TASK_CREATED", user.name ?? user.email, {
    taskTitle: task.title
  });
  await createActivity({
    userId: user.id,
    projectId,
    type: "TASK_CREATED",
    message,
    taskId: task.id
  });

  return NextResponse.json(task, { status: 201 });
}
