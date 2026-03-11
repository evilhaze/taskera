import { prisma } from "@/lib/prisma";

export type ActivityFeedItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  projectId: string;
  taskId: string | null;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    avatarEmoji: string | null;
  };
  project: { id: string; name: string };
  task: { id: string; title: string } | null;
};

export type ActivityFeedResult = {
  activities: ActivityFeedItem[];
  nextCursor: string | null;
};

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export async function getActivityFeed(
  userId: string,
  options: { limit?: number; cursor?: string } = {}
): Promise<ActivityFeedResult> {
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, options.limit ?? DEFAULT_LIMIT)
  );
  const page = options.cursor ? parseInt(options.cursor, 10) : 0;
  const skip = Number.isNaN(page) ? 0 : Math.max(0, page) * limit;

  const memberships = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return { activities: [], nextCursor: null };
  }

  let rows: Awaited<
    ReturnType<
      typeof prisma.activity.findMany<{
        include: {
          user: { select: { id: true; email: true; name: true; avatarUrl: true; avatarEmoji: true } };
          project: { select: { id: true; name: true } };
          task: { select: { id: true; title: true } };
        };
      }>
    >
  > = [];

  try {
    if (!prisma.activity) {
      return { activities: [], nextCursor: null };
    }
    rows = await prisma.activity.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit + 1,
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
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } }
      }
    });
  } catch {
    return { activities: [], nextCursor: null };
  }

  const hasMore = rows.length > limit;
  const activities = (hasMore ? rows.slice(0, limit) : rows).map((a) => ({
    id: a.id,
    type: a.type,
    message: a.message,
    createdAt: a.createdAt.toISOString(),
    projectId: a.projectId,
    taskId: a.taskId,
    user: a.user,
    project: a.project,
    task: a.task
  }));

  const nextCursor = hasMore ? String(page + 1) : null;

  return { activities, nextCursor };
}
