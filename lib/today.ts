import { prisma } from "@/lib/prisma";

export type TodayTaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string | null;
  projectId: string;
  project: { id: string; name: string };
  assignee: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
  } | null;
};

export type TodayTasksResult = {
  overdueTasks: TodayTaskItem[];
  todayTasks: TodayTaskItem[];
  upcomingTasks: TodayTaskItem[];
  recentTasks: TodayTaskItem[];
};

const selectTask = {
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
} as const;

function toItem(t: {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: Date | null;
  projectId: string;
  project: { id: string; name: string };
  assignee: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
  } | null;
}): TodayTaskItem {
  return {
    ...t,
    deadline: t.deadline?.toISOString() ?? null
  };
}

export async function getTodayTasks(userId: string): Promise<TodayTasksResult> {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return {
      overdueTasks: [],
      todayTasks: [],
      upcomingTasks: [],
      recentTasks: []
    };
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setUTCHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
  const endOfUpcoming = new Date(startOfToday);
  endOfUpcoming.setUTCDate(endOfUpcoming.getUTCDate() + 5);
  const recentSince = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [overdue, today, upcoming, recent] = await Promise.all([
    prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
        deadline: { lt: startOfToday, not: null }
      },
      select: selectTask,
      orderBy: { deadline: "asc" }
    }),
    prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
        deadline: { gte: startOfToday, lt: endOfToday }
      },
      select: selectTask,
      orderBy: { deadline: "asc" }
    }),
    prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        status: { not: "DONE" },
        deadline: { gte: endOfToday, lte: endOfUpcoming }
      },
      select: selectTask,
      orderBy: { deadline: "asc" }
    }),
    prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        updatedAt: { gte: recentSince }
      },
      select: selectTask,
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return {
    overdueTasks: overdue.map(toItem),
    todayTasks: today.map(toItem),
    upcomingTasks: upcoming.map(toItem),
    recentTasks: recent.map(toItem)
  };
}
