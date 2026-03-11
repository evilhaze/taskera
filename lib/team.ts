import { prisma } from "@/lib/prisma";

export type TeamMemberItem = {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  avatarEmoji: string | null;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
};

export async function getTeamMembers(
  userId: string
): Promise<TeamMemberItem[]> {
  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return [];
  }

  const memberRows = await prisma.projectMember.findMany({
    where: { projectId: { in: projectIds } },
    select: { userId: true }
  });
  const userIds = [...new Set(memberRows.map((m) => m.userId))];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      avatarEmoji: true
    }
  });

  const now = new Date();

  const stats = await Promise.all(
    userIds.map(async (uid) => {
      const [total, completed, inProgress, overdue] = await Promise.all([
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            assigneeId: uid
          }
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            assigneeId: uid,
            status: "DONE"
          }
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            assigneeId: uid,
            status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] }
          }
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            assigneeId: uid,
            status: { not: "DONE" },
            deadline: { lt: now, not: null }
          }
        })
      ]);
      return { userId: uid, total, completed, inProgress, overdue };
    })
  );

  const statMap = new Map(
    stats.map((s) => [
      s.userId,
      {
        totalTasks: s.total,
        completedTasks: s.completed,
        inProgressTasks: s.inProgress,
        overdueTasks: s.overdue
      }
    ])
  );

  return users.map((u) => {
    const s = statMap.get(u.id) ?? {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      overdueTasks: 0
    };
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      avatarEmoji: u.avatarEmoji,
      ...s
    };
  });
}
