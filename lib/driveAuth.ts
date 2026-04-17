import { db } from "@/lib/db";
import { account } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Returns a valid Google access token for the given user, refreshing it if expired.
 * Returns null if the user has no Google account or no refresh token available.
 */
export async function getValidDriveToken(userId: string): Promise<string | null> {
  const [googleAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "google")));

  if (!googleAccount?.accessToken) return null;
  if (!googleAccount.scope?.includes("drive.file")) return null;

  const isExpired = googleAccount.accessTokenExpiresAt
    ? googleAccount.accessTokenExpiresAt < new Date()
    : false;

  if (!isExpired) return googleAccount.accessToken;

  if (!googleAccount.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: googleAccount.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();

  await db
    .update(account)
    .set({
      accessToken: data.access_token,
      accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
    })
    .where(eq(account.id, googleAccount.id));

  return data.access_token;
}
