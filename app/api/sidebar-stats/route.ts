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
      todayTasksCount: 0,
      unreadNotificationsCount: 0
    });
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const [todayTasksCount, overdueCount] = await Promise.all([
    prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
        deadline: { gte: startOfToday, lt: endOfToday }
      }
    }),
    prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
        deadline: { lt: startOfToday, not: null }
      }
    })
  ]);

  const unreadNotificationsCount = overdueCount + todayTasksCount;

  return NextResponse.json({
    todayTasksCount,
    unreadNotificationsCount
  });
}
