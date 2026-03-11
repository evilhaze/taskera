import { prisma } from "@/lib/prisma";

export type UserProfileProject = {
  id: string;
  name: string;
  description: string | null;
  role: string;
};

export type UserProfileActivity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  projectId: string;
  taskId: string | null;
  project: { id: string; name: string };
  task: { id: string; title: string } | null;
};

export type UserProfileResult = {
  user: {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    nickname: string | null;
    birthDate: string | null;
    position: string | null;
    bio: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
    createdAt: string;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
  };
  projects: UserProfileProject[];
  recentActivity: UserProfileActivity[];
};

/**
 * Returns profile for user with id = targetUserId, only if currentUserId
 * shares at least one project with them (so we don't expose profiles to strangers).
 */
export async function getUserProfile(
  targetUserId: string,
  currentUserId: string
): Promise<UserProfileResult | null> {
  const currentMemberships = await prisma.projectMember.findMany({
    where: { userId: currentUserId },
    select: { projectId: true }
  });
  const currentProjectIds = currentMemberships.map((m) => m.projectId);
  if (currentProjectIds.length === 0) return null;

  const targetMemberships = await prisma.projectMember.findMany({
    where: { userId: targetUserId, projectId: { in: currentProjectIds } },
    select: { projectId: true, role: true }
  });
  if (targetMemberships.length === 0) return null;

  const sharedProjectIds = targetMemberships.map((m) => m.projectId);
  const roleByProjectId = new Map(
    targetMemberships.map((m) => [m.projectId, m.role])
  );

  const now = new Date();

  const [user, projects, statsRows, activities] = await Promise.all([
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        nickname: true,
        birthDate: true,
        position: true,
        bio: true,
        avatarUrl: true,
        avatarEmoji: true,
        createdAt: true
      }
    }),
    prisma.project.findMany({
      where: { id: { in: sharedProjectIds } },
      select: { id: true, name: true, description: true }
    }),
    Promise.all([
      prisma.task.count({
        where: {
          projectId: { in: sharedProjectIds },
          assigneeId: targetUserId
        }
      }),
      prisma.task.count({
        where: {
          projectId: { in: sharedProjectIds },
          assigneeId: targetUserId,
          status: "DONE"
        }
      }),
      prisma.task.count({
        where: {
          projectId: { in: sharedProjectIds },
          assigneeId: targetUserId,
          status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] }
        }
      }),
      prisma.task.count({
        where: {
          projectId: { in: sharedProjectIds },
          assigneeId: targetUserId,
          status: { not: "DONE" },
          deadline: { lt: now, not: null }
        }
      })
    ]),
    prisma.activity.findMany({
      where: {
        userId: targetUserId,
        projectId: { in: sharedProjectIds }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } }
      }
    })
  ]);

  if (!user) return null;

  const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = statsRows;

  const projectsWithRole: UserProfileProject[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    role: roleByProjectId.get(p.id) ?? "MEMBER"
  }));

  const recentActivity: UserProfileActivity[] = activities.map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    projectId: a.projectId,
    taskId: a.taskId,
    project: a.project,
    task: a.task
  }));

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      birthDate: user.birthDate?.toISOString() ?? null,
      position: user.position,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      avatarEmoji: user.avatarEmoji,
      createdAt: user.createdAt.toISOString()
    },
    stats: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks
    },
    projects: projectsWithRole,
    recentActivity
  };
}
