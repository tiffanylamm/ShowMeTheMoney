import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { driveTokens } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.BETTER_AUTH_URL}/?driveError=${error}`,
    );
  }

  // Verify CSRF state
  const storedState = request.cookies.get("drive_oauth_state")?.value;
  if (!state || !storedState || state !== storedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.BETTER_AUTH_URL}/api/drive/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 },
    );
  }

  const tokenData = await tokenRes.json();

  // Upsert drive token for this user
  await db
    .insert(driveTokens)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      accessTokenExpiresAt: tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000)
        : null,
      scope: tokenData.scope ?? null,
    })
    .onConflictDoUpdate({
      target: driveTokens.userId,
      set: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token ?? null,
        accessTokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
        scope: tokenData.scope ?? null,
      },
    });

  const response = NextResponse.redirect(`${process.env.BETTER_AUTH_URL}/`);
  response.cookies.delete("drive_oauth_state");
  return response;
}
