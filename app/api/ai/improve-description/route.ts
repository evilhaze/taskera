import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiImproveDescription } from "@/lib/ai/actions";
import { isAIAvailable } from "@/lib/ai/client";
import { mapAIErrorToResponse } from "@/lib/ai/errors";

async function ensureTaskAccess(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true }
  });
  if (!task) return null;
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId: task.projectId } }
  });
  return membership ? task : null;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isAIAvailable()) {
    return NextResponse.json(
      { message: "AI is not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const { taskId, title, description } = body as {
    taskId?: string;
    title?: string;
    description?: string | null;
  };

  let titleToUse: string;
  let descriptionToUse: string | null;

  if (taskId && typeof taskId === "string") {
    const task = await ensureTaskAccess(user.id, taskId);
    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    const full = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true, description: true }
    });
    if (!full) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }
    titleToUse = full.title;
    descriptionToUse = full.description;
  } else if (typeof title === "string" && title.trim()) {
    titleToUse = title.trim();
    descriptionToUse =
      description != null && typeof description === "string"
        ? description.trim() || null
        : null;
  } else {
    return NextResponse.json(
      { message: "taskId or title is required" },
      { status: 400 }
    );
  }

  let result;
  try {
    result = await aiImproveDescription(titleToUse, descriptionToUse);
  } catch (err: unknown) {
    const mapped = mapAIErrorToResponse(err);
    if (mapped) {
      return NextResponse.json({ message: mapped.message }, { status: mapped.status });
    }
    throw err;
  }

  if (!result) {
    return NextResponse.json(
      { message: "Failed to improve description" },
      { status: 502 }
    );
  }

  return NextResponse.json({ description: result.description });
}
