import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildProjectContext } from "@/lib/ai/context";
import { aiCreateTask, resolveAssigneeId } from "@/lib/ai/actions";
import { isAIAvailable } from "@/lib/ai/client";
import { mapAIErrorToResponse } from "@/lib/ai/errors";
import { isDemoUser } from "@/lib/demo";

async function ensureProjectAccess(userId: string, projectId: string) {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return membership;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(user)) {
    return NextResponse.json(
      {
        message: "AI Assistant доступен в подписке Taskera Plus.",
        code: "DEMO_AI_LOCKED",
        upsell: true
      },
      { status: 403 }
    );
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

  const { projectId, prompt } = body as { projectId?: string; prompt?: string };
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      { message: "projectId is required" },
      { status: 400 }
    );
  }
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { message: "prompt is required" },
      { status: 400 }
    );
  }

  const membership = await ensureProjectAccess(user.id, projectId);
  if (!membership) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  let draft;
  try {
    draft = await aiCreateTask(projectId, prompt.trim());
  } catch (err: unknown) {
    const mapped = mapAIErrorToResponse(err);
    if (mapped) {
      return NextResponse.json({ message: mapped.message }, { status: mapped.status });
    }
    throw err;
  }

  if (!draft) {
    return NextResponse.json(
      { message: "Failed to generate task draft" },
      { status: 502 }
    );
  }

  const ctx = await buildProjectContext(projectId);
  const assigneeId = resolveAssigneeId(draft.assigneeNameOrEmail, ctx.members);

  return NextResponse.json({
    draft: {
      title: draft.title,
      description: draft.description,
      assigneeId,
      assigneeNameOrEmail: draft.assigneeNameOrEmail,
      deadline: draft.deadline,
      priority: draft.priority,
      status: draft.status
    }
  });
}
