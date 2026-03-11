import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateLabelSchema } from "@/lib/validations/label";

async function ensureLabelAccess(userId: string, labelId: string) {
  const label = await prisma.label.findUnique({
    where: { id: labelId },
    select: { id: true, projectId: true }
  });
  if (!label) return null;

  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId: label.projectId }
    }
  });
  if (!membership) return null;

  return label;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ labelId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { labelId } = await params;
  const label = await ensureLabelAccess(user.id, labelId);
  if (!label) {
    return NextResponse.json({ message: "Label not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateLabelSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const updatePayload: { name?: string; color?: string } = {};
  if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name.trim();
  if (parsed.data.color !== undefined) updatePayload.color = parsed.data.color;

  const updated = await prisma.label.update({
    where: { id: labelId },
    data: updatePayload
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ labelId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { labelId } = await params;
  const label = await ensureLabelAccess(user.id, labelId);
  if (!label) {
    return NextResponse.json({ message: "Label not found" }, { status: 404 });
  }

  await prisma.label.delete({
    where: { id: labelId }
  });

  return NextResponse.json({ ok: true });
}
