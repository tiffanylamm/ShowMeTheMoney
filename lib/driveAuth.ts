import { db } from "@/lib/db";
import { driveTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns a valid Google Drive access token for the given user, refreshing it if expired.
 * Returns null if the user has not connected Google Drive.
 */
export async function getValidDriveToken(userId: string): Promise<string | null> {
  const [record] = await db
    .select()
    .from(driveTokens)
    .where(eq(driveTokens.userId, userId));

  if (!record?.accessToken) return null;

  const isExpired = record.accessTokenExpiresAt
    ? record.accessTokenExpiresAt < new Date()
    : false;

  if (!isExpired) return record.accessToken;

  if (!record.refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: record.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();

  await db
    .update(driveTokens)
    .set({
      accessToken: data.access_token,
      accessTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
    })
    .where(eq(driveTokens.userId, userId));

  return data.access_token;
}
