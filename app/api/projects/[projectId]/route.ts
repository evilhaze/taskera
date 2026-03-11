import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId: user.id, projectId }
    },
    include: {
      project: {
        include: {
          owner: { select: { id, email, name } },
          members: {
            include: {
              user: { select: { id, email, name } }
            }
          },
          _count: { select: { tasks: true } }
        }
      }
    }
  });

  if (!membership) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...membership.project,
    myRole: membership.role
  });
}
