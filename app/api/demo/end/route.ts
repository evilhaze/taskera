import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/", req.url));
}

export async function POST(req: NextRequest) {
  await clearAuthCookie();
  return NextResponse.redirect(new URL("/", req.url));
}
