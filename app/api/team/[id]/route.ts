import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserProfile } from "@/lib/userProfile";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const profile = await getUserProfile(id, user.id);
  if (!profile) {
    return NextResponse.json(
      { message: "User not found or no shared projects" },
      { status: 404 }
    );
  }

  return NextResponse.json(profile);
}
