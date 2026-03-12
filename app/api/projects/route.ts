import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";
import { createActivity, formatActivityMessage } from "@/lib/activity";
import { isDemoUser, DEMO_LIMITS } from "@/lib/demo";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { members: true, tasks: true } }
        }
      }
    }
  });

  const projectIds = memberships.map((m) => m.project.id);
  const [doneGroups, overdueGroups] =
    projectIds.length === 0
      ? [[], []]
      : await Promise.all([
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
          })
        ]);

  const doneByProject = new Map(doneGroups.map((g) => [g.projectId, g._count._all]));
  const overdueByProject = new Map(overdueGroups.map((g) => [g.projectId, g._count._all]));

  const projects = memberships.map((m) => {
    const totalTasks = m.project._count.tasks;
    const doneTasks = doneByProject.get(m.project.id) ?? 0;
    const overdueTasks = overdueByProject.get(m.project.id) ?? 0;
    const progressPercent =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return {
      ...m.project,
      myRole: m.role,
      totalTasks,
      doneTasks,
      overdueTasks,
      progressPercent
    };
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { name, description } = parsed.data;

  if (isDemoUser(user)) {
    const projectCount = await prisma.projectMember.count({
      where: { userId: user.id }
    });
    if (projectCount >= DEMO_LIMITS.maxProjects) {
      return NextResponse.json(
        {
          message: "В демо-режиме можно создать не более 3 проектов. Перейдите на Taskera Plus для полного доступа.",
          code: "DEMO_LIMIT_PROJECTS",
          upsell: true
        },
        { status: 403 }
      );
    }
  }

  const project = await prisma.project.create({
    data: {
      name,
      description: description ?? null,
      ownerId: user.id
    }
  });

  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      userId: user.id,
      role: "OWNER"
    }
  });

  const created = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      owner: { select: { id: true, email: true, name: true } },
      _count: { select: { members: true, tasks: true } }
    }
  });

  if (created) {
    const message = formatActivityMessage("PROJECT_CREATED", user.name ?? user.email);
    await createActivity({
      userId: user.id,
      projectId: project.id,
      type: "PROJECT_CREATED",
      message
    });
  }

  return NextResponse.json(created, { status: 201 });
}
