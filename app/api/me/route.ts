import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowedAvatarEmoji } from "@/lib/constants/avatar";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    avatarEmoji: user.avatarEmoji
  });
}

const updateMeSchema = {
  name: (v: unknown) => (v === undefined || (typeof v === "string" && v.length <= 200)) ? v as string | undefined : null,
  avatarEmoji: (v: unknown) => {
    if (v === undefined || v === null || v === "") return v as string | null | undefined;
    if (typeof v !== "string") return null;
    return isAllowedAvatarEmoji(v) ? v : null;
  }
};

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const name = updateMeSchema.name(raw.name);
  const avatarEmoji = updateMeSchema.avatarEmoji(raw.avatarEmoji);
  if (name === null || avatarEmoji === null) {
    return NextResponse.json({ message: "Validation error" }, { status: 400 });
  }

  const data: { name?: string | null; avatarEmoji?: string | null } = {};
  if (name !== undefined) data.name = name === "" ? null : name.trim() || null;
  if (avatarEmoji !== undefined) data.avatarEmoji = avatarEmoji === "" ? null : avatarEmoji;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl, avatarEmoji: user.avatarEmoji });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    avatarUrl: updated.avatarUrl,
    avatarEmoji: updated.avatarEmoji
  });
}
