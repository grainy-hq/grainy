import { getSession } from "@/lib/auth/session"
import { jsonError, jsonOk } from "@/lib/api/response"
import { db } from "@/lib/db/client"
import { adminAnnouncement } from "@/lib/db/schema"
import { env } from "@/env"
import { desc, eq } from "drizzle-orm"

export async function GET() {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const announcements = await db
    .select()
    .from(adminAnnouncement)
    .orderBy(desc(adminAnnouncement.createdAt))

  return jsonOk({ announcements })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session?.user) return jsonError("Unauthorized", 401)
  if (env.ADMIN_PASSWORD !== "GrainyTeam@2026") return jsonError("Forbidden", 403)

  const body = (await request.json()) as { message?: string; active?: boolean }
  if (!body.message?.trim()) return jsonError("Message is required")

  const id = crypto.randomUUID()
  await db.insert(adminAnnouncement).values({
    id,
    message: body.message.trim(),
    active: body.active ?? true,
  })

  return jsonOk({ id }, 201)
}
