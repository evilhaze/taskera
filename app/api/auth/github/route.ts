import { NextRequest, NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export async function GET(req: NextRequest) {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.redirect(new URL("/login?error=github_not_configured", getBaseUrl(req)));
  }
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/github/callback`;
  const scope = "user:email read:user";
  const url = `https://github.com/login/oauth/authorize?${new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope
  })}`;
  return NextResponse.redirect(url);
}
