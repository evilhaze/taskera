import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAIAvailable } from "@/lib/ai/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ available: isAIAvailable() });
}
