import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const main = async () => {
  try {
    // Ensure drizzle's migration tracking table exists and that the initial
    // migration (0000) is recorded — those tables were created outside of
    // drizzle-kit so the migrator has no record of them.
    await sql`CREATE SCHEMA IF NOT EXISTS drizzle`;
    await sql`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `;
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      SELECT '0000_daffy_korvac', 1776049731518
      WHERE NOT EXISTS (
        SELECT 1 FROM drizzle.__drizzle_migrations
        WHERE hash = '0000_daffy_korvac'
      )
    `;

    await migrate(db, { migrationsFolder: "./lib/db/migrations" });
    console.log("Migration completed");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
};

main();
