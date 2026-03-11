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
          owner: { select: { id: true, email: true, name: true } },
          members: {
            include: {
              user: { select: { id: true, email: true, name: true } }
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

export async function PATCH(
  req: NextRequest,
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
    }
  });

  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body === "object" && body !== null && "name" in body
    ? (body as { name: unknown }).name
    : undefined;
  const description = typeof body === "object" && body !== null && "description" in body
    ? (body as { description: unknown }).description
    : undefined;

  if (name !== undefined) {
    const s = typeof name === "string" ? name.trim() : "";
    if (s.length === 0 || s.length > 200) {
      return NextResponse.json(
        { message: "Название должно быть от 1 до 200 символов" },
        { status: 400 }
      );
    }
  }

  const updateData: { name?: string; description?: string | null } = {};
  if (name !== undefined) updateData.name = typeof name === "string" ? name.trim() : undefined;
  if (description !== undefined) updateData.description =
    typeof description === "string" ? description.trim() || null : null;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: updateData
  });

  return NextResponse.json(project);
}
