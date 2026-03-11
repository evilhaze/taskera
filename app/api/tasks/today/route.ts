import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTodayTasks } from "@/lib/today";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await getTodayTasks(user.id);
  return NextResponse.json(data);
}
