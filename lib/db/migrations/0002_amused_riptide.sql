-- 1. Create pages table + its FK and index
CREATE TABLE "pages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pages_userId_idx" ON "pages" USING btree ("user_id");--> statement-breakpoint

-- 2. Add page_id as NULLABLE first (so existing rows are allowed)
ALTER TABLE "transactions" ADD COLUMN "page_id" text;--> statement-breakpoint

-- 3. Create one "Default" page per user who already has transactions
INSERT INTO "pages" ("id", "user_id", "name", "created_at")
SELECT gen_random_uuid(), u."id", 'Default', (extract(epoch from now()) * 1000)::bigint
FROM "user" u
WHERE EXISTS (SELECT 1 FROM "transactions" t WHERE t."user_id" = u."id");--> statement-breakpoint

-- 4. Assign every existing transaction to its user's Default page
UPDATE "transactions" t
SET "page_id" = p."id"
FROM "pages" p
WHERE p."user_id" = t."user_id";--> statement-breakpoint

-- 5. Now add the FK, enforce NOT NULL, and swap the index
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "page_id" SET NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS "transactions_userId_parentId_createdAt_idx";--> statement-breakpoint
CREATE INDEX "transactions_userId_pageId_parentId_createdAt_idx" ON "transactions" USING btree ("user_id","page_id","parent_id","created_at");
