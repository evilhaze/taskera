import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getTeamMembers } from "@/lib/team";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const members = await getTeamMembers(user.id);
  return NextResponse.json(members);
}
