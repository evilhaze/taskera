import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);
  if (projectIds.length === 0) {
    return NextResponse.json({
      overdue: [],
      dueToday: []
    });
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      deadline: { not: null },
      status: { not: "DONE" },
      OR: [
        { deadline: { lt: startOfToday } },
        {
          deadline: { gte: startOfToday, lt: endOfToday }
        }
      ]
    },
    include: {
      project: { select: { id: true, name: true } }
    },
    orderBy: { deadline: "asc" }
  });

  const overdue = tasks.filter((t) => t.deadline && t.deadline < startOfToday);
  const dueToday = tasks.filter(
    (t) =>
      t.deadline &&
      t.deadline >= startOfToday &&
      t.deadline < endOfToday
  );

  return NextResponse.json({
    overdue: overdue.map((t) => ({
      id: t.id,
      title: t.title,
      deadline: t.deadline?.toISOString() ?? null,
      status: t.status,
      project: t.project
    })),
    dueToday: dueToday.map((t) => ({
      id: t.id,
      title: t.title,
      deadline: t.deadline?.toISOString() ?? null,
      status: t.status,
      project: t.project
    }))
  });
}
