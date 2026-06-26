import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db
    .select()
    .from(pages)
    .where(eq(pages.userId, session.user.id))
    .orderBy(asc(pages.createdAt));

  // Every user needs at least one page (transactions.pageId is NOT NULL).
  if (existing.length === 0) {
    const [created] = await db
      .insert(pages)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        name: "Default",
        createdAt: Date.now(),
      })
      .returning();
    return Response.json([created]);
  }

  return Response.json(existing);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(pages)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      name,
      createdAt: Date.now(),
    })
    .returning();

  return Response.json(created, { status: 201 });
}
