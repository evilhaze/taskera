import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // YYYY-MM
  const now = new Date();
  const year = monthParam ? parseInt(monthParam.slice(0, 4), 10) : now.getUTCFullYear();
  const month = monthParam ? parseInt(monthParam.slice(5, 7), 10) - 1 : now.getUTCMonth();

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);
  if (projectIds.length === 0) {
    return NextResponse.json({ tasks: [], byDate: {} });
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      deadline: { gte: start, lte: end }
    },
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      deadline: true,
      projectId: true,
      project: { select: { id: true, name: true } },
      assignee: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          avatarEmoji: true
        }
      }
    },
    orderBy: { deadline: "asc" }
  });

  const byDate: Record<string, typeof tasks> = {};
  for (const t of tasks) {
    if (!t.deadline) continue;
    const d = t.deadline;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(t);
  }

  const tasksSerialized = tasks.map((t) => ({
    ...t,
    deadline: t.deadline?.toISOString() ?? null
  }));

  const byDateSerialized: Record<string, typeof tasksSerialized> = {};
  for (const [k, arr] of Object.entries(byDate)) {
    byDateSerialized[k] = arr.map((t) => ({
      ...t,
      deadline: t.deadline?.toISOString() ?? null
    }));
  }

  return NextResponse.json({ tasks: tasksSerialized, byDate: byDateSerialized });
}
