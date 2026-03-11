import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ensureProjectAccess(userId: string, projectId: string) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const membership = await ensureProjectAccess(user.id, projectId);
  if (!membership) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  const limit = Math.min(50, Math.max(10, 20));
  let activities: Awaited<ReturnType<typeof prisma.activity.findMany>> = [];
  try {
    if (prisma.activity) {
      activities = await prisma.activity.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        take: limit,
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
    // модель Activity недоступна или ошибка БД — возвращаем пустой список
  }

  return NextResponse.json(activities);
}
