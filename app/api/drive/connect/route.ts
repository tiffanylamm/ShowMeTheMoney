import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nonce = crypto.randomUUID();

  const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  oauthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!);
  oauthUrl.searchParams.set(
    "redirect_uri",
    `${process.env.BETTER_AUTH_URL}/api/drive/callback`,
  );
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/drive.file",
  );
  oauthUrl.searchParams.set("access_type", "offline");
  oauthUrl.searchParams.set("prompt", "consent");
  oauthUrl.searchParams.set("state", nonce);

  const response = NextResponse.redirect(oauthUrl.toString());
  response.cookies.set("drive_oauth_state", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
