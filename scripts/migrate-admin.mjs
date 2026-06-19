import { drizzle } from "drizzle-orm/pg-proxy"

const url = "http://localhost:8080/query"
const token = "caK8LnHsXPmEzBovUdT6F1Z4NxG0YthQlegWjbAV3k7Ori5y2wCupDRIqJ9MSf"

const db = drizzle(async (sqlStr, params, method) => {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: JSON.stringify({ sql: sqlStr, params, method }),
  })
  if (!r.ok) throw new Error(await r.text())
  return { rows: await r.json() }
})

const statements = [
  `CREATE TABLE IF NOT EXISTS "admin_announcement" ("id" text PRIMARY KEY NOT NULL, "message" text NOT NULL, "active" boolean DEFAULT true NOT NULL, "created_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE INDEX IF NOT EXISTS "admin_announcement_active_idx" ON "admin_announcement" ("active");`,
  `CREATE TABLE IF NOT EXISTS "feature_toggle" ("id" text PRIMARY KEY NOT NULL, "feature_key" text NOT NULL UNIQUE, "enabled" boolean DEFAULT true NOT NULL, "description" text, "updated_at" timestamp DEFAULT now() NOT NULL);`,
  `CREATE INDEX IF NOT EXISTS "feature_toggle_key_idx" ON "feature_toggle" ("feature_key");`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f1', 'explore', true, 'Explore feed tab') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f2', 'comments', true, 'Commenting on posts') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f3', 'posting', true, 'Creating new posts') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f4', 'wows', true, 'Wow reactions') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f5', 'favorites', true, 'Favorites/bookmarks') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f6', 'signups', true, 'New user registration') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f7', 'friend_requests', true, 'Sending friend requests') ON CONFLICT ("feature_key") DO NOTHING;`,
  `INSERT INTO "feature_toggle" ("id", "feature_key", "enabled", "description") VALUES ('f8', 'direct_messages', true, 'Direct messaging') ON CONFLICT ("feature_key") DO NOTHING;`,
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
