import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/auth";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/github/callback`;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=github_not_configured", baseUrl));
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=github_no_code", baseUrl));
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: redirectUri
    })
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=github_token", baseUrl));
  }

  const tokens = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokens.access_token;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=github_token", baseUrl));
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/login?error=github_profile", baseUrl));
  }

  const profile = (await userRes.json()) as {
    email: string | null;
    name: string | null;
    avatar_url?: string;
    login: string;
  };

  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{ email: string; primary: boolean }>;
      const primary = emails.find((e) => e.primary) ?? emails[0];
      email = primary?.email ?? null;
    }
  }

  if (!email) {
    return NextResponse.redirect(new URL("/login?error=github_no_email", baseUrl));
  }

  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: profile.name ?? profile.login,
        avatarUrl: profile.avatar_url ?? undefined
      }
    });
  } else {
    const updates: { name?: string; avatarUrl?: string } = {};
    if (profile.name && !user.name) updates.name = profile.name;
    if (profile.avatar_url && !user.avatarUrl) updates.avatarUrl = profile.avatar_url;
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
