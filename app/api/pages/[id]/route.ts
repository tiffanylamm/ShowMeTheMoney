import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { and, eq, count } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const [updated] = await db
    .update(pages)
    .set({ name })
    .where(and(eq(pages.id, id), eq(pages.userId, session.user.id)))
    .returning();

  if (!updated) {
    return Response.json({ error: "Page not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Never let a user delete their last page — transactions.pageId is NOT NULL,
  // so every user must always have at least one page to add transactions to.
  const [{ total }] = await db
    .select({ total: count() })
    .from(pages)
    .where(eq(pages.userId, session.user.id));

  if (Number(total) <= 1) {
    return Response.json(
      { error: "Cannot delete your last page" },
      { status: 409 },
    );
  }

  const deleted = await db
    .delete(pages)
    .where(and(eq(pages.id, id), eq(pages.userId, session.user.id)))
    .returning({ id: pages.id });

  if (deleted.length === 0) {
    return Response.json({ error: "Page not found" }, { status: 404 });
  }

  // FK cascade removes all transactions on this page.
  return new Response(null, { status: 204 });
}
