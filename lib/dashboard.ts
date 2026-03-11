import { prisma } from "@/lib/prisma";

const STATUS_ORDER = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const;

export type DashboardAnalytics = {
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    reviewTasks: number;
    todoTasks: number;
    overdueTasks: number;
    completionRate: number;
    totalProjects: number;
    tasksCompletedThisWeek: number;
  };
  byStatus: Record<(typeof STATUS_ORDER)[number], number>;
  workloadByUser: Array<{
    userId: string;
    userName: string | null;
    userEmail: string;
    totalTasks: number;
    overdueTasks: number;
    doneTasks: number;
    activeTasks: number;
  }>;
  projectSummaries: Array<{
    id: string;
    name: string;
    description: string | null;
    membersCount: number;
    totalTasks: number;
    doneTasks: number;
    overdueTasks: number;
    progressPercent: number;
    myRole: string;
  }>;
  recentActivityPreview: Array<{
    id: string;
    message: string;
    createdAt: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
      avatarEmoji: string | null;
    };
    task: { id: string; title: string } | null;
    projectId: string;
  }>;
  overdueTasksPreview: Array<{
    id: string;
    title: string;
    deadline: string | null;
    projectId: string;
    projectName: string;
  }>;
};

export async function getDashboardAnalytics(
  userId: string
): Promise<DashboardAnalytics> {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return {
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        reviewTasks: 0,
        todoTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        totalProjects: 0,
        tasksCompletedThisWeek: 0
      },
      byStatus: { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 },
      workloadByUser: [],
      projectSummaries: [],
      recentActivityPreview: [],
      overdueTasksPreview: []
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalTasks,
    statusGroups,
    overdueCount,
    tasksCompletedThisWeek,
    workloadRaw,
    projectsWithCounts,
    overdueTasksList
  ] = await Promise.all([
    prisma.task.count({ where: { projectId: { in: projectIds } } }),
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId: { in: projectIds } },
      _count: { _all: true }
    }),
    prisma.task.count({
      where: {
        projectId: { in: projectIds },
        deadline: { lt: now },
        status: { not: "DONE" }
      }
    }),
    prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: "DONE",
        updatedAt: { gte: sevenDaysAgo }
      }
    }),
    prisma.task.groupBy({
      by: ["assigneeId"],
      where: { projectId: { in: projectIds } },
      _count: { _all: true }
    }),
    prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        _count: { select: { members: true, tasks: true } }
      }
    }),
    prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        deadline: { lt: now },
        status: { not: "DONE" }
      },
      orderBy: { deadline: "asc" },
      take: 5,
      include: { project: { select: { id: true, name: true } } }
    })
  ]);

  let recentActivities: Awaited<
    ReturnType<
      typeof prisma.activity.findMany<{
        include: {
          user: { select: { id: true; email: true; name: true; avatarUrl: true; avatarEmoji: true } };
          task: { select: { id: true; title: true } };
        };
      }>
    >
  > = [];
  try {
    if (prisma.activity) {
      recentActivities = await prisma.activity.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
              avatarEmoji: true
            }
          },
          task: { select: { id: true, title: true } }
        }
      });
    }
  } catch {
    // ignore
  }

  const byStatus: Record<(typeof STATUS_ORDER)[number], number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    REVIEW: 0,
    DONE: 0
  };
  for (const row of statusGroups) {
    byStatus[row.status] = row._count._all;
  }

  const completedTasks = byStatus.DONE;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const assigneeIds = [
    ...new Set(workloadRaw.map((w) => w.assigneeId).filter(Boolean))
  ] as string[];
  const workloadDetails =
    assigneeIds.length === 0
      ? []
      : await Promise.all(
          assigneeIds.map(async (assigneeId) => {
            const [total, overdue, done] = await Promise.all([
              prisma.task.count({
                where: { projectId: { in: projectIds }, assigneeId }
              }),
              prisma.task.count({
                where: {
                  projectId: { in: projectIds },
                  assigneeId,
                  deadline: { lt: now },
                  status: { not: "DONE" }
                }
              }),
              prisma.task.count({
                where: {
                  projectId: { in: projectIds },
                  assigneeId,
                  status: "DONE"
                }
              })
            ]);
            return { assigneeId, total, overdue, done };
          })
        );

  const users =
    assigneeIds.length === 0
      ? []
      : await prisma.user.findMany({
          where: { id: { in: assigneeIds } },
          select: { id: true, email: true, name: true }
        });
  const userMap = new Map(users.map((u) => [u.id, u]));
  const workloadByUser = workloadDetails.map((w) => {
    const u = userMap.get(w.assigneeId)!;
    return {
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      totalTasks: w.total,
      overdueTasks: w.overdue,
      doneTasks: w.done,
      activeTasks: w.total - w.done
    };
  });

  const [doneByProject, overdueByProject] = await Promise.all([
    prisma.task.groupBy({
      by: ["projectId"],
      where: { projectId: { in: projectIds }, status: "DONE" },
      _count: { _all: true }
    }),
    prisma.task.groupBy({
      by: ["projectId"],
      where: {
        projectId: { in: projectIds },
        deadline: { lt: now },
        status: { not: "DONE" }
      },
      _count: { _all: true }
    })
  ]);
  const doneMap = new Map(doneByProject.map((g) => [g.projectId, g._count._all]));
  const overdueMap = new Map(
    overdueByProject.map((g) => [g.projectId, g._count._all])
  );

  const memberRoles = await prisma.projectMember.findMany({
    where: { userId, projectId: { in: projectIds } },
    select: { projectId: true, role: true }
  });
  const roleMap = new Map(memberRoles.map((m) => [m.projectId, m.role]));

  const projectSummaries = projectsWithCounts.map((p) => {
    const total = p._count.tasks;
    const doneTasks = doneMap.get(p.id) ?? 0;
    const overdueTasks = overdueMap.get(p.id) ?? 0;
    const progressPercent =
      total > 0 ? Math.round((doneTasks / total) * 100) : 0;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      membersCount: p._count.members,
      totalTasks: total,
      doneTasks,
      overdueTasks,
      progressPercent,
      myRole: roleMap.get(p.id) ?? "MEMBER"
    };
  });

  const recentActivityPreview = recentActivities.map((a) => ({
    id: a.id,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    user: a.user,
    task: a.task,
    projectId: a.projectId
  }));

  const overdueTasksPreview = overdueTasksList.map((t) => ({
    id: t.id,
    title: t.title,
    deadline: t.deadline?.toISOString() ?? null,
    projectId: t.project.id,
    projectName: t.project.name
  }));

  return {
    summary: {
      totalTasks,
      completedTasks: byStatus.DONE,
      inProgressTasks: byStatus.IN_PROGRESS,
      reviewTasks: byStatus.REVIEW,
      todoTasks: byStatus.TODO,
      overdueTasks: overdueCount,
      completionRate,
      totalProjects: projectIds.length,
      tasksCompletedThisWeek: tasksCompletedThisWeek
    },
    byStatus,
    workloadByUser,
    projectSummaries,
    recentActivityPreview,
    overdueTasksPreview
  };
}
