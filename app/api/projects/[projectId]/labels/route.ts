import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLabelSchema } from "@/lib/validations/label";

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

  const labels = await prisma.label.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(labels);
}

export async function POST(
  req: NextRequest,
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createLabelSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const label = await prisma.label.create({
    data: {
      projectId,
      name: parsed.data.name.trim(),
      color: parsed.data.color
    }
  });

  return NextResponse.json(label, { status: 201 });
}
