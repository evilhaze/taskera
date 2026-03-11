import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LIMIT = 10;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({
      projects: [],
      tasks: [],
      users: []
    });
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    select: { projectId: true }
  });
  const projectIds = memberships.map((m) => m.projectId);

  if (projectIds.length === 0) {
    return NextResponse.json({
      projects: [],
      tasks: [],
      users: []
    });
  }

  const searchFilter = () => ({ contains: q, mode: "insensitive" as const });

  const [projects, tasks, memberUserIds] = await Promise.all([
    prisma.project.findMany({
      where: {
        id: { in: projectIds },
        OR: [
          { name: searchFilter() },
          { description: { not: null, ...searchFilter() } }
        ]
      },
      select: { id: true, name: true, description: true },
      take: LIMIT
    }),
    prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        OR: [
          { title: searchFilter() },
          { description: { not: null, ...searchFilter() } }
        ]
      },
      select: {
        id: true,
        title: true,
        status: true,
        projectId: true,
        project: { select: { id: true, name: true } }
      },
      take: LIMIT
    }),
    prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      select: { userId: true }
    })
  ]);

  const userIds = [...new Set(memberUserIds.map((m) => m.userId))];

  const users =
    userIds.length === 0
      ? []
      : await prisma.user.findMany({
          where: {
            id: { in: userIds },
            OR: [
              { email: searchFilter() },
              { name: { not: null, ...searchFilter() } }
            ]
          },
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            avatarEmoji: true
          },
          take: LIMIT
        });

  return NextResponse.json({
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      projectId: t.projectId,
      project: t.project
    })),
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
      avatarEmoji: u.avatarEmoji
    }))
  });
}
