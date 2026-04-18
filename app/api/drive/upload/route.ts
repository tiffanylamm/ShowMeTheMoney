import { auth } from "@/lib/auth";
import { getValidDriveToken } from "@/lib/driveAuth";

const FOLDER_NAME = "showmethemoney";

async function getOrCreateFolder(accessToken: string): Promise<string> {
  // Search for an existing folder the app created
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`,
    )}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (searchRes.ok) {
    const { files } = await searchRes.json();
    if (files?.length > 0) return files[0].id;
  }

  // Create it if not found
  const createRes = await fetch(
    "https://www.googleapis.com/drive/v3/files?fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: "application/vnd.google-apps.folder",
      }),
    },
  );

  const folder = await createRes.json();
  return folder.id;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = await getValidDriveToken(session.user.id);
  if (!accessToken) {
    return Response.json(
      { error: "No Google Drive access. Please reconnect your Google account." },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

  const folderId = await getOrCreateFolder(accessToken);

  const boundary = "-------314159265358979323846";
  const metadata = JSON.stringify({ name: file.name, parents: [folderId] });
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const enc = new TextEncoder();

  const body = new Uint8Array([
    ...enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    ...enc.encode(`--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`),
    ...fileBytes,
    ...enc.encode(`\r\n--${boundary}--`),
  ]);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );

  if (!res.ok) {
    const err = await res.json();
    return Response.json(
      { error: err.error?.message ?? "Upload failed" },
      { status: res.status },
    );
  }

  return Response.json(await res.json(), { status: 201 });
}
