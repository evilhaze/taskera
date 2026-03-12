import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAIAvailable } from "@/lib/ai/client";

export type DashboardData = {
  projects: Array<{ id: string; name: string; progressPercent: number }>;
  sidebarStats: { todayTasksCount: number; unreadNotificationsCount: number };
  aiEnabled: boolean;
};

export async function getDashboardData(userId: string): Promise<DashboardData> {
  return unstable_cache(
    async () => getDashboardDataUncached(userId),
    ["dashboard-data", userId],
    { revalidate: 30 }
  )();
}

async function getDashboardDataUncached(userId: string): Promise<DashboardData> {
  const [memberships, aiEnabled] = await Promise.all([
    prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true }
    }),
    Promise.resolve(isAIAvailable())
  ]);
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return {
      projects: [],
      sidebarStats: { todayTasksCount: 0, unreadNotificationsCount: 0 },
      aiEnabled
    };
  }

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);

  const [projectsWithCount, doneGroups, overdueGroups, todayCount, overdueCount] =
    await Promise.all([
      prisma.project.findMany({
        where: { id: { in: projectIds } },
        select: { id: true, name: true, _count: { select: { tasks: true } } }
      }),
      prisma.task.groupBy({
        by: ["projectId"],
        where: { projectId: { in: projectIds }, status: "DONE" },
        _count: { _all: true }
      }),
      prisma.task.groupBy({
        by: ["projectId"],
        where: {
          projectId: { in: projectIds },
          deadline: { lt: new Date() },
          status: { not: "DONE" }
        },
        _count: { _all: true }
      }),
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

  const doneByProject = new Map(doneGroups.map((g) => [g.projectId, g._count._all]));
  const overdueByProject = new Map(
    overdueGroups.map((g) => [g.projectId, g._count._all])
  );

  const projects = projectsWithCount.map((p) => {
    const total = p._count.tasks;
    const doneTasks = doneByProject.get(p.id) ?? 0;
    const progressPercent = total > 0 ? Math.round((doneTasks / total) * 100) : 0;
    return { id: p.id, name: p.name, progressPercent };
  });

  return {
    projects,
    sidebarStats: {
      todayTasksCount: todayCount,
      unreadNotificationsCount: todayCount + overdueCount
    },
    aiEnabled
  };
}
