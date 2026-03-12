import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDemoUser } from "@/lib/demo-seed";
import { setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (!dbUrl) {
    return NextResponse.redirect(new URL("/demo", req.url));
  }

  const user = await getOrCreateDemoUser();
  await setAuthCookie(user.id);
  return NextResponse.redirect(new URL("/app/dashboard", req.url));
}
