import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiProjectSummary } from "@/lib/ai/actions";
import { isAIAvailable } from "@/lib/ai/client";
import { mapAIErrorToResponse } from "@/lib/ai/errors";
import { isDemoUser } from "@/lib/demo";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (isDemoUser(user)) {
    return NextResponse.json(
      { message: "AI Assistant доступен в подписке Taskera Plus.", code: "DEMO_AI_LOCKED", upsell: true },
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

  const { projectId } = body as { projectId?: string };
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json(
      { message: "projectId is required" },
      { status: 400 }
    );
  }

  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: user.id, projectId } }
  });
  if (!membership) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  let result;
  try {
    result = await aiProjectSummary(projectId);
  } catch (err: unknown) {
    const mapped = mapAIErrorToResponse(err);
    if (mapped) {
      return NextResponse.json({ message: mapped.message }, { status: mapped.status });
    }
    throw err;
  }

  if (!result) {
    return NextResponse.json(
      { message: "Failed to generate summary" },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
