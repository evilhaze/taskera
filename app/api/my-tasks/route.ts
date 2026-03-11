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
    return NextResponse.json([]);
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: { in: projectIds },
      assigneeId: user.id
    },
    include: {
      assignee: { select: { id: true, email: true, name: true } },
      project: { select: { id: true, name: true } }
    },
    orderBy: [{ status: "asc" }, { order: "asc" }, { deadline: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json(tasks);
}
