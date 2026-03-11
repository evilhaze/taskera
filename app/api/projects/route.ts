import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          owner: { select: { id: true, email: true, name: true } },
          _count: { select: { members: true, tasks: true } }
        }
      }
    }
  });

  const projects = memberships.map((m) => ({
    ...m.project,
    myRole: m.role
  }));

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

  return NextResponse.json(created, { status: 201 });
}
