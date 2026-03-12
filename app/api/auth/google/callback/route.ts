import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", baseUrl));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google_no_code", baseUrl));
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Google token error:", err);
    return NextResponse.redirect(new URL("/login?error=google_token", baseUrl));
  }

  const tokens = (await tokenRes.json()) as { access_token: string };
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` }
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(new URL("/login?error=google_profile", baseUrl));
  }

  const profile = (await userInfoRes.json()) as {
    email: string;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
  };

  if (!profile.email) {
    return NextResponse.redirect(new URL("/login?error=google_no_email", baseUrl));
  }

  let user = await prisma.user.findUnique({
    where: { email: profile.email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name ?? profile.given_name ?? profile.email.split("@")[0],
        avatarUrl: profile.picture ?? undefined,
        firstName: profile.given_name ?? undefined,
        lastName: profile.family_name ?? undefined
      }
    });
  } else {
    const updates: { name?: string; avatarUrl?: string; firstName?: string; lastName?: string } = {};
    if (profile.name && !user.name) updates.name = profile.name;
    if (profile.picture && !user.avatarUrl) updates.avatarUrl = profile.picture;
    if (profile.given_name && !user.firstName) updates.firstName = profile.given_name;
    if (profile.family_name && !user.lastName) updates.lastName = profile.family_name;
    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updates
      });
    }
  }

  await setAuthCookie(user.id);
  return NextResponse.redirect(new URL("/app/dashboard", baseUrl));
}
