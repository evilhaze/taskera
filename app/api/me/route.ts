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
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname,
    birthDate: user.birthDate?.toISOString().slice(0, 10) ?? null,
    position: user.position,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    avatarEmoji: user.avatarEmoji,
    createdAt: user.createdAt.toISOString()
  });
}

const str = (max: number) => (v: unknown) =>
  v === undefined
    ? (v as undefined)
    : v === null || v === ""
      ? null
      : typeof v === "string" && v.length <= max
        ? v
        : null;

const updateMeSchema = {
  name: str(200),
  firstName: str(100),
  lastName: str(100),
  nickname: str(100),
  position: str(200),
  bio: str(2000),
  avatarUrl: (v: unknown) => {
    if (v === undefined) return v as undefined;
    if (v === null || v === "") return null;
    if (typeof v !== "string" || v.length > 2000) return null;
    try {
      new URL(v);
      return v;
    } catch {
      return null;
    }
  },
  avatarEmoji: (v: unknown) => {
    if (v === undefined || v === null || v === "") return v as string | null | undefined;
    if (typeof v !== "string") return null;
    return isAllowedAvatarEmoji(v) ? v : null;
  },
  birthDate: (v: unknown) => {
    if (v === undefined) return v as undefined;
    if (v === null || v === "") return null;
    if (typeof v !== "string") return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
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
  const firstName = updateMeSchema.firstName(raw.firstName);
  const lastName = updateMeSchema.lastName(raw.lastName);
  const nickname = updateMeSchema.nickname(raw.nickname);
  const position = updateMeSchema.position(raw.position);
  const bio = updateMeSchema.bio(raw.bio);
  const avatarUrl = updateMeSchema.avatarUrl(raw.avatarUrl);
  const avatarEmoji = updateMeSchema.avatarEmoji(raw.avatarEmoji);
  const birthDate = updateMeSchema.birthDate(raw.birthDate);

  /** Return 400 only when a non-empty value was sent but validation failed. */
  const invalidOptional = (
    rawVal: unknown,
    validated: string | null | undefined
  ) =>
    validated === null &&
    rawVal !== undefined &&
    rawVal !== null &&
    String(rawVal).trim() !== "";
  const invalidDate = (rawVal: unknown, validated: Date | null | undefined) =>
    validated === null &&
    rawVal !== undefined &&
    rawVal !== null &&
    String(rawVal).trim() !== "";

  if (
    invalidOptional(raw.name, name) ||
    invalidOptional(raw.firstName, firstName) ||
    invalidOptional(raw.lastName, lastName) ||
    invalidOptional(raw.nickname, nickname) ||
    invalidOptional(raw.position, position) ||
    invalidOptional(raw.bio, bio) ||
    invalidOptional(raw.avatarUrl, avatarUrl) ||
    invalidOptional(raw.avatarEmoji, avatarEmoji) ||
    invalidDate(raw.birthDate, birthDate)
  ) {
    return NextResponse.json({ message: "Validation error" }, { status: 400 });
  }

  const data: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    nickname?: string | null;
    position?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    avatarEmoji?: string | null;
    birthDate?: Date | null;
  } = {};
  if (raw.name !== undefined)
    data.name = name == null || name === "" ? null : String(name).trim() || null;
  if (raw.firstName !== undefined)
    data.firstName = firstName == null || firstName === "" ? null : String(firstName).trim() || null;
  if (raw.lastName !== undefined)
    data.lastName = lastName == null || lastName === "" ? null : String(lastName).trim() || null;
  if (raw.nickname !== undefined)
    data.nickname = nickname == null || nickname === "" ? null : String(nickname).trim() || null;
  if (raw.position !== undefined)
    data.position = position == null || position === "" ? null : String(position).trim() || null;
  if (raw.bio !== undefined)
    data.bio = bio == null || bio === "" ? null : String(bio).trim() || null;
  if (raw.avatarUrl !== undefined)
    data.avatarUrl = avatarUrl == null || avatarUrl === "" ? null : avatarUrl;
  if (raw.avatarEmoji !== undefined)
    data.avatarEmoji = avatarEmoji == null || avatarEmoji === "" ? null : avatarEmoji;
  if (raw.birthDate !== undefined) data.birthDate = birthDate ?? null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      nickname: user.nickname,
      birthDate: user.birthDate?.toISOString().slice(0, 10) ?? null,
      position: user.position,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      avatarEmoji: user.avatarEmoji,
      createdAt: user.createdAt.toISOString()
    });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data
  });

  return NextResponse.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    firstName: updated.firstName,
    lastName: updated.lastName,
    nickname: updated.nickname,
    birthDate: updated.birthDate?.toISOString().slice(0, 10) ?? null,
    position: updated.position,
    bio: updated.bio,
    avatarUrl: updated.avatarUrl,
    avatarEmoji: updated.avatarEmoji,
    createdAt: updated.createdAt.toISOString()
  });
}
