import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getActivityFeed } from "@/lib/activityFeed";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const cursor = searchParams.get("cursor") ?? undefined;

  const result = await getActivityFeed(user.id, { limit, cursor });
  return NextResponse.json(result);
}
