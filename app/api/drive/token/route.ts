import { auth } from "@/lib/auth";
import { getValidDriveToken } from "@/lib/driveAuth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = await getValidDriveToken(session.user.id);
  if (!accessToken) {
    return Response.json(
      { error: "No Google Drive access. Please reconnect your Google account." },
      { status: 403 },
    );
  }

  return Response.json({ accessToken });
}
