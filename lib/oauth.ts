/**
 * OAuth: редирект на провайдера и обмен code на токен + получение профиля.
 * Переменные окружения:
 * - Google: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 * - GitHub: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 */

export function getGoogleAuthUrl(redirectUri: string, state?: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    ...(state && { state })
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function getGoogleUserFromCode(code: string, redirectUri: string) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google token: ${err}`);
  }
  const tokenData = (await tokenRes.json()) as { access_token: string };
  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  if (!userRes.ok) throw new Error("Google userinfo failed");
  const user = (await userRes.json()) as { id: string; email: string; name?: string; picture?: string };
  return { email: user.email, name: user.name ?? null, avatarUrl: user.picture ?? null };
}

export function getGitHubAuthUrl(redirectUri: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: "user:email read:user",
    state
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function getGitHubUserFromCode(code: string, redirectUri: string) {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    })
  });
  if (!tokenRes.ok) throw new Error("GitHub token failed");
  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const token = tokenData.access_token;
  if (!token) throw new Error("GitHub: no access_token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!userRes.ok) throw new Error("GitHub user failed");
  const user = (await userRes.json()) as { id: number; login: string; name?: string; avatar_url?: string; email?: string };

  let email = user.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as { email: string; primary: boolean }[];
      const primary = emails.find((e) => e.primary) ?? emails[0];
      email = primary?.email ?? user.login;
    } else {
      email = `${user.login}@users.noreply.github.com`;
    }
  }

  return {
    email,
    name: user.name ?? user.login ?? null,
    avatarUrl: user.avatar_url ?? null
  };
}
