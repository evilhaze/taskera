import { prisma } from "@/lib/prisma";

export type ProjectMemberForAI = {
  id: string;
  name: string | null;
  email: string;
};

export async function buildProjectContext(projectId: string): Promise<{
  projectName: string;
  projectDescription: string | null;
  members: ProjectMemberForAI[];
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  recentActivityMessages: string[];
}> {
  const [project, members, counts, activities] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, description: true }
    }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } }
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId },
      _count: true
    }),
    prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { message: true }
    })
  ]);

  if (!project) {
    throw new Error("Project not found");
  }

  const now = new Date();
  const [overdueCount, deadlineCounts] = await Promise.all([
    prisma.task.count({
      where: {
        projectId,
        status: { not: "DONE" },
        deadline: { lt: now, not: null }
      }
    }),
    Promise.resolve(
      counts.reduce(
        (acc, c) => {
          acc[c.status] = c._count;
          return acc;
        },
        {} as Record<string, number>
      )
    )
  ]);

  const totalTasks = counts.reduce((s, c) => s + c._count, 0);
  const doneTasks = deadlineCounts["DONE"] ?? 0;
  const inProgressTasks =
    (deadlineCounts["TODO"] ?? 0) +
    (deadlineCounts["IN_PROGRESS"] ?? 0) +
    (deadlineCounts["REVIEW"] ?? 0);

  return {
    projectName: project.name,
    projectDescription: project.description,
    members: members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email
    })),
    totalTasks,
    doneTasks,
    inProgressTasks,
    overdueTasks: overdueCount,
    recentActivityMessages: activities.map((a) => a.message)
  };
}

export type TaskContextForAI = {
  title: string;
  description: string | null;
};

export function buildTaskContext(
  title: string,
  description: string | null
): TaskContextForAI {
  return { title, description: description ?? null };
}
