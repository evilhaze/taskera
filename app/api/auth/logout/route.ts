import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  clearAuthCookie();
  return NextResponse.redirect(new URL("/login", req.url));
}
