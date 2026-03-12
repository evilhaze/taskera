import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDemoUser } from "@/lib/demo-seed";
import { signAuthToken } from "@/lib/auth";

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (!dbUrl) {
    return NextResponse.redirect(new URL("/demo", req.url));
  }

  const user = await getOrCreateDemoUser();
  const token = signAuthToken({ userId: user.id });

  const redirectUrl = new URL("/app/dashboard", req.url);
  const res = NextResponse.redirect(redirectUrl);
  res.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE
  });
  return res;
}
