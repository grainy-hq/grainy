import { jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { adminAnnouncement } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const [announcement] = await db
    .select()
    .from(adminAnnouncement)
    .where(eq(adminAnnouncement.active, true))
    .limit(1)

  return jsonOk({ announcement: announcement ?? null })
}
