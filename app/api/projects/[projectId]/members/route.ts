import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMemberSchema } from "@/lib/validations/project";

export async function POST(
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
    return NextResponse.json(
      { message: "Only the project owner can add members" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Validation error";
    return NextResponse.json({ message }, { status: 400 });
  }

  const { email } = parsed.data;

  const invitedUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!invitedUser) {
    return NextResponse.json(
      { message: "User with this email not found" },
      { status: 404 }
    );
  }

  if (invitedUser.id === user.id) {
    return NextResponse.json(
      { message: "You are already in the project" },
      { status: 400 }
    );
  }

  try {
    await prisma.projectMember.create({
      data: {
        projectId,
        userId: invitedUser.id,
        role: "MEMBER"
      }
    });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json(
        { message: "User is already in the project" },
        { status: 409 }
      );
    }
    throw e;
  }

  return NextResponse.json(
    {
      id: invitedUser.id,
      email: invitedUser.email,
      name: invitedUser.name
    },
    { status: 201 }
  );
}
