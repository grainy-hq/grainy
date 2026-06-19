import { drizzle } from "drizzle-orm/pg-proxy"

const url = "http://localhost:8080/query"
const token = "caK8LnHsXPmEzBovUdT6F1Z4NxG0YthQlegWjbAV3k7Ori5y2wCupDRIqJ9MSf"

const db = drizzle(async (sqlStr, params, method) => {
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ sql: sqlStr, params, method }),
  })
  if (!r.ok) throw new Error(await r.text())
  return { rows: await r.json() }
})

const statements = [
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned_from_posting" boolean DEFAULT false NOT NULL;`,
  `ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "banned_from_commenting" boolean DEFAULT false NOT NULL;`,
  `CREATE TABLE IF NOT EXISTS "explore_post" ("id" text PRIMARY KEY NOT NULL, "author_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "caption" text, "image_url" text, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE INDEX IF NOT EXISTS "explore_post_authorId_idx" ON "explore_post" ("author_id");`,
  `CREATE INDEX IF NOT EXISTS "explore_post_createdAt_idx" ON "explore_post" ("created_at");`,
  `CREATE TABLE IF NOT EXISTS "explore_wow" ("id" text PRIMARY KEY NOT NULL, "post_id" text NOT NULL REFERENCES "explore_post"("id") ON DELETE CASCADE, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "explore_wow_post_user_idx" ON "explore_wow" ("post_id", "user_id");`,
  `CREATE INDEX IF NOT EXISTS "explore_wow_postId_idx" ON "explore_wow" ("post_id");`,
  `CREATE TABLE IF NOT EXISTS "explore_comment" ("id" text PRIMARY KEY NOT NULL, "post_id" text NOT NULL REFERENCES "explore_post"("id") ON DELETE CASCADE, "author_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "content" text NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE INDEX IF NOT EXISTS "explore_comment_postId_idx" ON "explore_comment" ("post_id");`,
  `CREATE INDEX IF NOT EXISTS "explore_comment_authorId_idx" ON "explore_comment" ("author_id");`,
  `CREATE TABLE IF NOT EXISTS "explore_save" ("id" text PRIMARY KEY NOT NULL, "post_id" text NOT NULL REFERENCES "explore_post"("id") ON DELETE CASCADE, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "explore_save_post_user_idx" ON "explore_save" ("post_id", "user_id");`,
  `CREATE TABLE IF NOT EXISTS "repost" ("id" text PRIMARY KEY NOT NULL, "explore_post_id" text NOT NULL REFERENCES "explore_post"("id") ON DELETE CASCADE, "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "repost_post_user_idx" ON "repost" ("explore_post_id", "user_id");`,
  `CREATE TABLE IF NOT EXISTS "report" ("id" text PRIMARY KEY NOT NULL, "reporter_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "target_user_id" text REFERENCES "user"("id") ON DELETE CASCADE, "target_post_id" text, "target_explore_post_id" text, "reason" text NOT NULL, "status" text DEFAULT 'pending' NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE INDEX IF NOT EXISTS "report_status_idx" ON "report" ("status");`,
  `CREATE TABLE IF NOT EXISTS "admin_log" ("id" text PRIMARY KEY NOT NULL, "action" text NOT NULL, "target_user_id" text, "details" text, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE INDEX IF NOT EXISTS "admin_log_createdAt_idx" ON "admin_log" ("created_at");`,
]

async function run() {
  for (const stmt of statements) {
    const short = stmt.length > 80 ? stmt.slice(0, 80) + "..." : stmt
    console.log("Running:", short)
    try {
      await db.execute(stmt, [], "all")
    } catch (e) {
      console.error("Error:", e instanceof Error ? e.message : e)
    }
  }
  console.log("Migration complete!")
}

run().catch(console.error)
