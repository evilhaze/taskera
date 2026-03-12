import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { aiSuggestSubtasks } from "@/lib/ai/actions";
import { isAIAvailable } from "@/lib/ai/client";
import { mapAIErrorToResponse } from "@/lib/ai/errors";

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

  const { title, description } = body as {
    title?: string;
    description?: string | null;
  };

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { message: "title is required" },
      { status: 400 }
    );
  }

  const desc =
    description != null && typeof description === "string"
      ? description.trim() || null
      : null;

  let result;
  try {
    result = await aiSuggestSubtasks(title.trim(), desc);
  } catch (err: unknown) {
    const mapped = mapAIErrorToResponse(err);
    if (mapped) {
      return NextResponse.json({ message: mapped.message }, { status: mapped.status });
    }
    throw err;
  }

  if (!result) {
    return NextResponse.json(
      { message: "Failed to suggest subtasks" },
      { status: 502 }
    );
  }

  return NextResponse.json({ subtasks: result.subtasks });
}
