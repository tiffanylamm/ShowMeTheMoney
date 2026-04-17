import { auth } from "@/lib/auth";
import { getValidDriveToken } from "@/lib/driveAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await params;
  const accessToken = await getValidDriveToken(session.user.id);

  if (!accessToken) {
    return Response.json(
      { error: "No Google Drive access. Please reconnect your Google account." },
      { status: 403 },
    );
  }

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,webViewLink`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    const err = await res.json();
    return Response.json(
      { error: err.error?.message ?? "Drive API error" },
      { status: res.status },
    );
  }

  return Response.json(await res.json());
}
